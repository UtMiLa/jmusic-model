import { Pitch } from './../model/pitches/pitch';
import { Rational } from './../model/rationals/rational';
import { Time, TimeSpan } from './../model/rationals/time';
import { Observable } from 'rxjs';

export interface MidiNoteEvent {
    pitch: number;
    velocity: number;
}

export interface MidiControllerEvent {
    controller: number;
    value: number;
}

export type MidiEvent = MidiControllerEvent | MidiNoteEvent;

export function isMidiNoteEvent(test: MidiEvent): test is MidiNoteEvent {
    return (test as MidiNoteEvent).pitch !== undefined;
}

export function isMidiControllerEvent(test: MidiEvent): test is MidiControllerEvent {
    return (test as MidiControllerEvent).controller !== undefined;
}

export interface KeyboardEvent {
    key: string;
    action: 'down' | 'up';
}

export interface MidiInService {
    events: Observable<MidiEvent>;
}

export interface KeyboardService {
    events: Observable<KeyboardEvent>;
}

export interface Command {
    command: string;
    data: any;
}



export interface EntryProcessor {
    subscribeMidi(midiIn: MidiInService): void;
    subscribeKeyboard(kbdIn: KeyboardService): void;
    commandGenerator: Observable<Command>;
}





export interface IEntryScore {
    removeLast(): void;
    counter: TimeSpan;
    addChord(chord: EntryChord): void;
    addRest(time: TimeSpan): EntryRest;
    addTies(pitches: Pitch[]): void;
}


export class EntryNote {
    constructor(public pitch: Pitch, public duration: TimeSpan, public tie = false) {
    }

    refCount = 1;

    addDuration(extra: TimeSpan) {
        this.duration = Time.addSpans(this.duration, extra);
    }

    deepCopy(): any {
        const res = new EntryNote(this.pitch, {...this.duration}, this.tie);
        res.refCount = this.refCount;
        return res;
    }

    toString() {
        let dur = Rational.shorten(this.duration);
        let points = '';
        if (dur.numerator === 7) {
            points = '..';
            dur = {...dur, numerator: 4};
            dur = Rational.shorten(dur);
        } else if (dur.numerator === 3) {
            points = '.';
            dur = {...dur, numerator: 2};
            dur = Rational.shorten(dur);
        }
        const tieString = this.tie ? '~' : '';

        console.log('not tostring', this, this.pitch.pitchClassName, dur.denominator, points, tieString );

        return this.pitch.lilypond + dur.denominator + points + tieString + ' ';
    }
}

export class EntryRest {
    constructor(public duration: TimeSpan, public tie = false) {
    }

    deepCopy(): any {
        return new EntryRest(this.duration, this.tie);
    }

    toString(): string {
        let dur = {...Rational.shorten(this.duration)};
        let points = '';
        if (dur.numerator === 7) {
            points = '..';
            dur.numerator = 4;
            dur = Rational.shorten(dur);
        } else if (dur.numerator === 3) {
            points = '.';
            dur.numerator = 2;
            dur = Rational.shorten(dur);
        }

        //console.log('rest toString()', this, dur, points);


        return 'r' + dur.denominator + points + ' ';
    }
}

export class EntryChord {
    constructor(private notes: EntryNote[] = []) {
    }

    sort() {
        this.notes.sort((n1, n2) => n1.pitch.diatonicNumber < n2.pitch.diatonicNumber ? 1: -1);
        return this;
    }

    getNotes() {
        return this.notes;
    }

    add(note: EntryNote) {
        const fnd = this.find(note.pitch);
        if (fnd) {
            fnd.refCount++;
            //console.log('add note', this.notes);
        } else {
            this.notes.push(note);
            this.sort();
        }
    }

    forEach(x: (value: EntryNote, index: number, array: EntryNote[]) => void, noVoices: number) {
        this.notes.forEach(x);
        for (let i = this.notes.length; i < noVoices; i++) {
            x(this.notes[this.notes.length - 1], i, this.notes);
        }
    }

    find(p: Pitch): EntryNote | undefined {
        if (!p) return undefined;
        //console.log('find', p);

        return this.notes.find(n => n.pitch && n.pitch.scientific === p.scientific);
    }

    deepCopy() {
        return new EntryChord(this.notes.map(note => note.deepCopy()));
    }
}

