import { Rational } from '../../model/rationals/rational';
import { AbsoluteTime } from './../rationals/time';
import { Note } from '../notes/note';
import { Time, TimeSpan } from '../rationals/time';

export interface SequenceDef {
    elements: string;
}

export interface TimeSlot {
    time: AbsoluteTime;
    elements: Note[];
}
export class Sequence {
    constructor(public def: SequenceDef) {
        this.elements = def.elements ? Sequence.splitByNotes(def.elements).map(str => Note.parseLily(str)) : [];
    }

    elements: Note[] = [];

    static createFromString(def: string): Sequence {
        return new Sequence({ elements: def });
    }

    static splitByNotes(def: string): string[] {
        return def.split(' ').reduce((prev: string[], curr: string) => {
            if (prev.length) {
                if (prev[prev.length - 1].match(/^<[^>]*$/)) {
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
        const res = [] as TimeSlot[];

        this.elements.forEach(elem => {
            const slot = res.find(item => Time.equals(item.time, time));
            if (!slot) {
                res.push({ time, elements: [elem]});
            } else {
                slot.elements.push(elem);
            }
            time  = Time.addTime(time, elem.duration);
        });

        return res;
    }
}