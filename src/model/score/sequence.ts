import { LongDecorationElement } from './../decorations/decoration-type';
//import { generateUniqueId } from '../../tools/unique-id';
import { Meter, MeterFactory } from './../states/meter';
import { Pitch } from './../pitches/pitch';
import { Key } from './../states/key';
import { TimeMap } from './../../tools/time-map';
import { StateChange } from './../states/state';
import { AbsoluteTime, ExtendedTime } from './../rationals/time';
import { createNoteFromLilypond, getRealDuration, Note, setNoteId } from '../notes/note';
import { Time, TimeSpan } from '../rationals/time';
import { Clef, ClefDef } from '../states/clef';
import { EventType, getExtendedTime } from './timing-order';
import R = require('ramda');
import { FlexibleItem, MultiFlexibleItem } from './types';
import { Spacer, createSpacerFromLilypond, isSpacer } from '../notes/spacer';

export type MusicEvent = Note | Spacer | StateChange | LongDecorationElement;

export interface SeqEnumerationState {
    clef?: Clef;
    key?: Key;
    meter?: Meter;
}


export function isStateChange(item: MusicEvent): item is StateChange {
    return (item as StateChange).isState;
}

export function isMeterChange(item: MusicEvent): item is StateChange {
    return isStateChange(item) && !!item.meter;
}

export function isKeyChange(item: MusicEvent): item is StateChange {
    return isStateChange(item) && !!item.key;
}

export function isClefChange(item: MusicEvent): item is StateChange {
    return isStateChange(item) && !!item.clef;
}

export function isLongDecoration(item: MusicEvent): item is LongDecorationElement {
    return (item as LongDecorationElement).longDeco !== undefined;
}

export function isNote(item: MusicEvent): item is Note {
    return (item as Note).pitches !== undefined;
}

export function isMusicEvent(item: unknown): item is MusicEvent {
    return isStateChange(item as MusicEvent) || isLongDecoration(item as MusicEvent) || isSpacer(item as MusicEvent) || isNote(item as MusicEvent);
}

export function getDuration(item: MusicEvent): TimeSpan {
    if (isSpacer(item)) {
        return item.duration;
    }
    if (isNote(item)) {
        return getRealDuration(item);
    }
    return Time.NoTime;
}

export interface ISequence {
    elements: MusicEvent[];
    duration: TimeSpan;
    chainElements<T>(callBack: (elm: MusicEvent, time: AbsoluteTime, state?: SeqEnumerationState) => T[], initState?: SeqEnumerationState): T[];
    filterElements(callBack: (elm: MusicEvent, time: AbsoluteTime, state?: SeqEnumerationState) => boolean, initState?: SeqEnumerationState): MusicEvent[];
    groupByTimeSlots(keyPrefix: string): TimeSlot[];
    insertElement(time: AbsoluteTime, elm: MusicEvent): void;
    appendElement(elm: MusicEvent): void;
    indexOfTime(time: AbsoluteTime): number;
    asObject: SequenceDef;
}

export interface ISequenceCollection {
    seqs: ISequence[];
}

export type SequenceDef = string | FlexibleItem[];
export type MultiSequenceDef = string | MultiFlexibleItem[];

export interface TimeSlot {
    time: AbsoluteTime;
    elements: Note[];
    states: StateChange[];
    decorations?: LongDecorationElement[];
}

export function parseLilyKey(ly: string): Key {
    const tokens = ly.split(' ');
    if (tokens.length !== 3) throw 'Illegal key change: ' + ly;

    switch(tokens[2]) {
        case '\\major': return Key.fromMode(Pitch.parseLilypond(tokens[1]).pitchClass, 'major');
        case '\\minor': return Key.fromMode(Pitch.parseLilypond(tokens[1]).pitchClass, 'minor');
    }
    throw 'Illegal key change: ' + ly;
}

export function parseLilyMeter(ly: string): Meter {
    const tokens = ly.split(' ');
    if (tokens.length !== 2 || !/^\d+\/\d+$/.test(tokens[1])) throw 'Illegal meter change: ' + ly;

    const [count, value] = tokens[1].split('/');

    return MeterFactory.createRegularMeter({ count: +count, value: +value });
}

function lilyClefType(clefType: string): Clef {
    switch(clefType) {
        case 'G': case 'G2': case 'violin': case 'treble': return Clef.clefTreble;
        case 'tenorG': return Clef.clefTenor;
        case 'tenor': return Clef.clefTenorC;
        case 'F': case 'bass': return Clef.clefBass;
        case 'C': case 'alto': return Clef.clefAlto;
    }
    throw 'Illegal clef: ' + clefType;
}

export function parseLilyClef(ly: string): Clef {
    ly = ly.replace('\\clef ', '');

    const parsed = /([a-zA-Z]+)(([_^])(\d+))?/.exec(ly);

    if (!parsed) throw '';

    const [orig, clefType, _, transPosition, transNumber] = parsed;
    
    const clef = lilyClefType(clefType);

    if (transPosition) {
        const sign = transPosition === '_' ? -1 : 1;
        const interval = parseInt(transNumber);

        return new Clef({...clef.def, transpose: sign * (interval - 1) });
    }
    
    return clef;
}

export function parseLilyElement(ly: string): Note | Spacer | StateChange {
    if (ly.startsWith('\\clef')) {
        const sc = new StateChange();
        sc.clef = parseLilyClef(ly);
        return sc;
    } else if (ly.startsWith('\\key')) {
        const sc = new StateChange();
        sc.key = parseLilyKey(ly);
        return sc;
    } else if (ly.startsWith('\\meter')) {
        const sc = new StateChange();
        sc.meter = parseLilyMeter(ly);
        return sc;
    } else if (ly.startsWith('s') || ly.startsWith('\\skip')) {
        return createSpacerFromLilypond(ly);
    } else {
        return createNoteFromLilypond(ly);
    }

}

export abstract class BaseSequence implements ISequence {
    abstract elements: MusicEvent[];
    abstract duration: TimeSpan;
    abstract asObject: SequenceDef;

    /*protected uniqueId = generateUniqueId();*/

    abstract insertElement(time: AbsoluteTime, elm: MusicEvent): void;
    appendElement(elm: MusicEvent): void { throw 'appendElement not implemented'; }

    getTimeSlots(): ExtendedTime[] {
        let time: ExtendedTime = Time.newAbsolute(0, 1);
        const res = [] as ExtendedTime[];

        this.elements.forEach(elem => {
            if (!res.find(item => Time.equals(item, time))) {
                res.push(time);
            }
            if (isNote(elem) && elem.grace) {
                if (time.extended) {
                    time = {...time, extended: time.extended + 1};
                } else {
                    time = {...time, extended: -100};
                }
            } else {
                time  = Time.addTime(time, getDuration(elem));
            }
        });

        return res;
    }

    indexOfTime(time: AbsoluteTime): number {
        let timeR = Time.StartTime;
        return this.elements.findIndex(elem => {
            if (Time.equals(time, timeR)) return true;
            timeR = Time.addTime(timeR, getDuration(elem));
            return false;
        });
    }

    private static updateState(oldState: SeqEnumerationState | undefined, event: MusicEvent): SeqEnumerationState | undefined {
        if (oldState && isStateChange(event)) {
            if (event.meter) oldState = { ...oldState, meter: event.meter };
            if (event.clef) oldState = { ...oldState, clef: event.clef };
            if (event.key) oldState = { ...oldState, key: event.key };
        }
        return oldState;
    }

    private _reduce<T, S>(
        convertAccu: (oldAccu: T[], curr: MusicEvent, callBackResult: S) => T[], 
        callBack: (elm: MusicEvent, time: AbsoluteTime, state?: SeqEnumerationState) => S, 
        initState?: SeqEnumerationState
    ): T[] {
        return this.elements.reduce((prev: { accu: T[], time: AbsoluteTime, state?: SeqEnumerationState }, curr) => {
            return { 
                accu: convertAccu(prev.accu, curr, callBack(curr, prev.time, prev.state)), 
                time: Time.addTime(prev.time, getDuration(curr)),
                state: BaseSequence.updateState(prev.state, curr)
            };
        }, { 
            accu: [], 
            time: Time.StartTime, 
            state: initState 
        }).accu;
    }

    /** Like seq.elements.map(), but with additional parameters to callback:
     * time: time from beginning of sequence
     * state: optional state information about current key, clef, and meter. Only provided if initState is provided.
     */
    chainElements<T>(callBack: (elm: MusicEvent, time: AbsoluteTime, state?: SeqEnumerationState) => T[], initState?: SeqEnumerationState): T[] {
        return this._reduce((oldAccu, curr, callBackResult) => callBackResult ? [...oldAccu, ...callBackResult] : oldAccu, callBack, initState);
    }

    /** Like seq.elements.filter(), but with additional parameters to callback:
     * time: time from beginning of sequence
     * state: optional state information about current key, clef, and meter. Only provided if initState is provided.
     */
    filterElements(callBack: (elm: MusicEvent, time: AbsoluteTime, state?: SeqEnumerationState) => boolean, initState?: SeqEnumerationState): MusicEvent[] {
        return this._reduce<MusicEvent, boolean>((oldAccu, curr, callBackResult) => callBackResult ? [...oldAccu, curr] : oldAccu, callBack, initState);
    }

    groupByTimeSlots(keyPrefix: string): TimeSlot[] {
        let time: ExtendedTime = Time.newAbsolute(0, 1);
        
        const res = new TimeMap<TimeSlot>((time) => ({ time, elements: [], states: []}));

        let graceGroup = 0;
        this.elements.forEach((elem, index) => {
            // if grace note, set extended accordingly on time
            if (isNote(elem) && elem.grace) {
                if (graceGroup) {
                    graceGroup++;
                    time = getExtendedTime(time, EventType.GraceNote, graceGroup); //time = {...time, extended: graceGroup};
                } else {
                    graceGroup = 1;
                    time = getExtendedTime(time, EventType.GraceNote, graceGroup); // {...time, extended: graceGroup};
                }
            } else {
                graceGroup = 0;
            }
            if (isStateChange(elem)) {

                const slot = res.get(getExtendedTime(time, EventType.Bar));
                slot.states.push(elem);
                
            } else if (isLongDecoration(elem)) {

                const slot = res.get(getExtendedTime(time, EventType.Expression));
                if (!slot.decorations) slot.decorations = [];
                slot.decorations.push(elem as LongDecorationElement);

            } else if (isSpacer(elem)) {

                /*const slot = res.get(getExtendedTime(time, EventType.Expression));
                if (!slot.decorations) slot.decorations = [];
                slot.decorations.push(elem as LongDecorationElement);*/

            } else {
                
                const slot = res.get(getExtendedTime(time, EventType.Note));
                slot.elements.push(setNoteId(elem, keyPrefix, index));
                
            }

            time = Time.addTime(time, getDuration(elem));

        });

        return res.items.sort((i1, i2) => Time.sortComparison(i1.index, i2.index)).map(item => item.value);
    }

}


export class SimpleSequence extends BaseSequence {
    constructor(def: string) {
        super();

        this.asObject = def;
    }

    private _def!: string;
    public get asObject(): SequenceDef {
        return this._def;
    }
    public set asObject(value: SequenceDef) {
        if (typeof value !== 'string') {
            throw 'Illegal argument to new SimpleSequence()';
        }
        this._def = value;
        this._elements = value ? splitByNotes(value).map(str => parseLilyElement(str)) : [];
    }

    private _elements: MusicEvent[] = [];
    public get elements(): MusicEvent[] {
        return this._elements;
    }

    public addElement(element: MusicEvent): void {
        this._elements.push(element);
    }

    public insertElement(time: AbsoluteTime, element: MusicEvent): void {
        const i = this.indexOfTime(time);
        this._elements.splice(i, 0, element);
    }

    static createFromString(def: string): SimpleSequence {
        return new SimpleSequence(def);
    }

    /*static splitByNotes(def: string): string[] {
        return def.split(' ').reduce((prev: string[], curr: string) => {
            if (prev.length) {
                if (prev[prev.length - 1].match(/^<[^>]*$/)) {
                    prev[prev.length - 1] += ` ${curr}`;
                    return prev;
                } else if (prev[prev.length - 1].match(/^\\(clef)$/)) {
                    prev[prev.length - 1] += ` ${curr}`;
                    return prev;
                } else if (prev[prev.length - 1].match(/^\\(meter)$/)) {
                    prev[prev.length - 1] += ` ${curr}`;
                    return prev;
                } else if (prev[prev.length - 1].match(/^\\(key)( \w+)?$/)) {
                    prev[prev.length - 1] += ` ${curr}`;
                    return prev;
                }
            }
            return prev.concat([curr]);
        }, []);
    }*/

    get count(): number {
        return this.elements.length;
    }

    get duration(): TimeSpan {
        return this.elements.reduce((prev, curr) => Time.addSpans(prev, getDuration(curr)), Time.newSpan(0, 1));
    }

}


export class CompositeSequence extends BaseSequence {
    constructor(...sequences: ISequence[]) {
        super();
        this._sequences = sequences;
    }

    public get asObject(): SequenceDef {
        return this._sequences.map(s => s.asObject);
    }
    public set asObject(value: SequenceDef) {
        throw 'Not supported';
    }

    private _sequences: ISequence[];

    public get elements(): MusicEvent[] {
        return this._sequences
            .reduce((prev: MusicEvent[], curr: ISequence) => prev.concat(curr.elements), []);
    }

    public insertElement(time: AbsoluteTime, element: MusicEvent): void {
        throw 'CompositeSequence does not support insertElement';
    }

    public get duration(): TimeSpan {
        return this._sequences.reduce((prev: TimeSpan, curr: ISequence) => Time.addSpans(prev, curr.duration), Time.newSpan(0, 1));
    }

}


export function splitByNotes(def: string): string[] {
    return def.split(' ').reduce((prev: string[], curr: string) => {
        if (prev.length) {
            if (prev[prev.length - 1].match(/^<[^>]*$/)) {
                prev[prev.length - 1] += ` ${curr}`;
                return prev;
            } else if (prev[prev.length - 1].match(/^\\(clef)$/)) {
                prev[prev.length - 1] += ` ${curr}`;
                return prev;
            } else if (prev[prev.length - 1].match(/^\\(meter)$/)) {
                prev[prev.length - 1] += ` ${curr}`;
                return prev;
            } else if (prev[prev.length - 1].match(/^\\(key)( \w+)?$/)) {
                prev[prev.length - 1] += ` ${curr}`;
                return prev;
            }
        }
        return prev.concat([curr]);
    }, []);
}

export const __internal = { /*parseLilyClef, parseLilyKey,*/ parseLilyElement/*, parseLilyMeter*/ };