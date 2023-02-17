import { LongDecorationElement } from './../decorations/decoration-type';
//import { generateUniqueId } from '../../tools/unique-id';
import { Meter, MeterFactory } from './../states/meter';
import { Pitch } from './../pitches/pitch';
import { Key } from './../states/key';
import { TimeMap } from './../../tools/time-map';
import { StateChange } from './../states/state';
import { AbsoluteTime, ExtendedTime } from './../rationals/time';
import { createNoteFromLilypond, Note, setNoteId } from '../notes/note';
import { Time, TimeSpan } from '../rationals/time';
import { Clef } from '../states/clef';
import { EventType, getExtendedTime } from './timing-order';

export type MusicEvent = Note | StateChange | LongDecorationElement;


export function isStateChange(item: MusicEvent): item is StateChange {
    return (item as StateChange).isState;
}

export function isLongDecoration(item: MusicEvent): item is LongDecorationElement {
    return (item as LongDecorationElement).longDeco !== undefined;
}

export function isNote(item: MusicEvent): item is Note {
    return (item as Note).pitches !== undefined;
}

export interface ISequence {
    elements: MusicEvent[];
    duration: TimeSpan;
    groupByTimeSlots(keyPrefix: string): TimeSlot[];
    insertElement(time: AbsoluteTime, elm: MusicEvent): void;
}

export interface SequenceDef {
    elements: string;
}

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

export function parseLilyClef(ly: string): Clef {
    ly = ly.replace('\\clef ', '');
    switch(ly) {
        case 'G': case 'G2': case 'violin': case 'treble': return Clef.clefTreble;
        case 'tenorG': return Clef.clefTenor;
        case 'tenor': return Clef.clefTenorC;
        case 'F': case 'bass': return Clef.clefBass;
        case 'C': case 'alto': return Clef.clefAlto;
    }
    throw 'Illegal clef: ' + ly;
}

function parseLilyElement(ly: string): Note | StateChange {
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
    } else {
        return createNoteFromLilypond(ly);
    }

}

export abstract class BaseSequence implements ISequence {
    abstract elements: MusicEvent[];
    abstract duration: TimeSpan;

    /*protected uniqueId = generateUniqueId();*/

    abstract insertElement(time: AbsoluteTime, elm: MusicEvent): void;

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
                time  = Time.addTime(time, elem.duration);
            }
        });

        return res;
    }

    indexOfTime(time: AbsoluteTime): number {
        let timeR = Time.StartTime;
        return this.elements.findIndex(elem => {
            if (Time.equals(time, timeR)) return true;
            timeR = Time.addTime(timeR, elem.duration);
            return false;
        });
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

            } else {
                
                const slot = res.get(getExtendedTime(time, EventType.Note));
                slot.elements.push(setNoteId(elem, keyPrefix, index));
                
            }

            time  = Time.addTime(time, elem.duration);

        });

        return res.items.sort((i1, i2) => Time.sortComparison(i1.index, i2.index)).map(item => item.value);
    }

}


export class SimpleSequence extends BaseSequence {
    constructor(def: string) {
        super();

        this.def = def;
    }

    private _def!: string;
    public get def(): string {
        return this._def;
    }
    public set def(value: string) {
        this._def = value;
        this._elements = value ? SimpleSequence.splitByNotes(value).map(str => parseLilyElement(str)) : [];
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

    static splitByNotes(def: string): string[] {
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

    get count(): number {
        return this.elements.length;
    }

    get duration(): TimeSpan {
        return this.elements.reduce((prev, curr) => Time.addSpans(prev, curr.duration), Time.newSpan(0, 1));
    }

}


export class CompositeSequence extends BaseSequence {
    constructor(...sequences: ISequence[]) {
        super();
        this._sequences = sequences;
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


export const __internal = { /*parseLilyClef, parseLilyKey,*/ parseLilyElement/*, parseLilyMeter*/ };