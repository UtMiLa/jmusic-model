import { Note } from '../notes/note';
import { Time, TimeSpan } from '../rationals/time';

export interface SequenceDef {
    elements: string;
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
}