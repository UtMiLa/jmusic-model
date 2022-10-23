//import { generateUniqueId } from '../../tools/unique-id';
import { Meter, MeterFactory } from './../states/meter';
import { Pitch } from './../pitches/pitch';
import { Key } from './../states/key';
import { TimeMap } from './../../tools/time-map';
import { StateChange } from './../states/state';
import { AbsoluteTime } from './../rationals/time';
import { Note } from '../notes/note';
import { Time, TimeSpan } from '../rationals/time';
import { Clef } from '../states/clef';


export interface ISequence {
    elements: (Note | StateChange)[];
    duration: TimeSpan;
    groupByTimeSlots(keyPrefix: string): TimeSlot[];
}

export interface SequenceDef {
    elements: string;
}

export interface TimeSlot {
    time: AbsoluteTime;
    elements: Note[];
    states: StateChange[];
}

function parseLilyKey(ly: string): Key {
    const tokens = ly.split(' ');
    if (tokens.length !== 3) throw 'Illegal key change: ' + ly;

    switch(tokens[2]) {
        case '\\major': return Key.fromMode(Pitch.parseLilypond(tokens[1]).pitchClass, 'major');
        case '\\minor': return Key.fromMode(Pitch.parseLilypond(tokens[1]).pitchClass, 'minor');
    }
    throw 'Illegal key change: ' + ly;
}

function parseLilyMeter(ly: string): Meter {
    const tokens = ly.split(' ');
    if (tokens.length !== 2 || !/^\d+\/\d+$/.test(tokens[1])) throw 'Illegal meter change: ' + ly;

    const [count, value] = tokens[1].split('/');

    return MeterFactory.createRegularMeter({ count: +count, value: +value });
}

function parseLilyClef(ly: string): Clef {
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
        return Note.parseLily(ly);
    }

}

export abstract class BaseSequence implements ISequence {
    abstract elements: (StateChange | Note)[];
    abstract duration: TimeSpan;

    /*protected uniqueId = generateUniqueId();

    /*transferElement(element: (StateChange | Note), index: number): (StateChange | Note) {
        if ((element as StateChange).isState) {
            return element;    
        }
        const note = element as Note;
        return note;// Note.clone(note, { uniq: this.uniqueId + '/' + index });
    }*/

    getTimeSlots(): AbsoluteTime[] {
        let time = Time.newAbsolute(0, 1);
        const res = [] as AbsoluteTime[];

        this.elements.forEach(elem => {
            if (!res.find(item => Time.equals(item, time))) {
                res.push(time);
            }
            time  = Time.addTime(time, elem.duration);
        });

        return res;
    }

    groupByTimeSlots(keyPrefix: string): TimeSlot[] {
        let time = Time.newAbsolute(0, 1);
        
        const res = new TimeMap<TimeSlot>((time) => ({ time, elements: [], states: []}));

        this.elements.forEach((elem, index) => {
            const slot = res.get(time);
            if ((elem as StateChange).isState) {
                //console.log('statechg', elem);
                
                slot.states.push(elem as StateChange);
                
            } else {
                slot.elements.push(Note.clone(elem as Note, { uniq: `${keyPrefix}-${index}` }));
            }
            time  = Time.addTime(time, elem.duration);
        });

        return res.items.map(item => item.value);
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

    private _elements: (Note | StateChange)[] = [];
    public get elements(): (Note | StateChange)[] {
        return this._elements;
    }

    public addElement(element: (Note | StateChange)): void {
        this._elements.push(element);
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

    public get elements(): (Note | StateChange)[] {
        return this._sequences
            .reduce((prev: (Note | StateChange)[], curr: ISequence) => prev.concat(curr.elements), []);
    }

    public get duration(): TimeSpan {
        return this._sequences.reduce((prev: TimeSpan, curr: ISequence) => Time.addSpans(prev, curr.duration), Time.newSpan(0, 1));
    }

}


export const __internal = { parseLilyClef, parseLilyKey, parseLilyElement, parseLilyMeter };