import { TimeMap } from './../../tools/time-map';
import { StateChange } from './../states/state';
import { AbsoluteTime } from './../rationals/time';
import { Note } from '../notes/note';
import { Time, TimeSpan } from '../rationals/time';
import { Clef } from '../states/clef';

export interface SequenceDef {
    elements: string;
}

export interface TimeSlot {
    time: AbsoluteTime;
    elements: Note[];
    states: StateChange[];
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
    } else {
        return Note.parseLily(ly);
    }

}

export class Sequence {
    constructor(public def: SequenceDef) {
        this.elements = def.elements ? Sequence.splitByNotes(def.elements).map(str => parseLilyElement(str)) : [];
    }

    elements: (Note | StateChange)[] = [];

    static createFromString(def: string): Sequence {
        return new Sequence({ elements: def });
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

    groupByTimeSlots(): TimeSlot[] {
        let time = Time.newAbsolute(0, 1);
        
        const res = new TimeMap<TimeSlot>((time) => ({ time, elements: [], states: []}));

        this.elements.forEach(elem => {
            const slot = res.get(time);
            if ((elem as StateChange).isState) {
                
                slot.states.push(elem as StateChange);
                
            } else {
                slot.elements.push(elem as Note);
            }
            time  = Time.addTime(time, elem.duration);
        });

        return res.items.map(item => item.item);
    }
}

export const __internal = { parseLilyClef, parseLilyElement };