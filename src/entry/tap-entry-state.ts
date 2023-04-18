import { Pitch, Time } from "./../model";
import { EntryChord, EntryNote, EntryRest, IEntryScore } from "./entry";

export interface TapEntryState {
    noteOn(pitch: number, notesPressed: number[]): TapEntryState;
    noteOff(pitch: number, notesPressed: number[]): TapEntryState;
    p1On(notesPressed: number[]): TapEntryState;
    p2On(notesPressed: number[]): TapEntryState;
}

export class EmptyTapEntryState implements TapEntryState {
    constructor(private score: IEntryScore) {}

    noteOn(pitch: number, notesPressed: number[]): TapEntryState {
        const res = new ChordSmartInputState(this.score, new EntryChord());
        res.noteOn(pitch, notesPressed);
        return res;
    }

    noteOff(pitch: number, notesPressed: number[]): TapEntryState {
        return this;
    }
    p1On(notesPressed: number[]): TapEntryState {
        // push rest to voices
        return new RestSmartInputState(this.score);
    }
    p2On(notesPressed: number[]): TapEntryState {
        this.score.removeLast();
        return this; // remove last
    }
}

export class ChordSmartInputState implements TapEntryState {
    constructor(private score: IEntryScore, private longNotesPressed: EntryChord) {
        if (longNotesPressed) {
            this.chord = longNotesPressed.deepCopy();
        }
    }

    chord = new EntryChord();

    setCurrent() {
        //this.score.setCurrentChord(this.chord.sort());
    }

    noteOn(pitch: number, notesPressed: number[]): TapEntryState {
        console.log('noteOn',pitch);

        this.chord.add(new EntryNote(Pitch.fromMidi(pitch), this.score.counter));
        //this.setCurrent();
        console.log('noteOn this.chord',this.chord);

        return this;
    }
    noteOff(pitch: number, notesPressed: number[]): TapEntryState {
        //console.log('chord noteOff', notesPressed);

        if (!notesPressed.length) {
            this.score.addChord(this.chord.deepCopy());
            //console.log('noteOff', this.chord, notesPressed);

            return new EmptyTapEntryState(this.score);
        }
        return this;
    }
    p1On(notesPressed: number[]): TapEntryState {
        //this.score.addCurrentChordDuration(defaultDuration);
        this.score.addChord(this.chord.deepCopy());
        this.score.addTies(this.chord.getNotes().map(n => n.pitch));
        //this.score.addTies(notesPressed.map(n => Pitch.createFromMidi(n)));
        //console.log('p1 on', this.chord, notesPressed);
        return this;
    }
    p2On(notesPressed: number[]): TapEntryState {
        this.score.addChord(this.chord.deepCopy());
        this.score.addTies(notesPressed.map(n => Pitch.fromMidi(n)));
        //console.log('p2 on', this.chord, notesPressed);
        return new ChordSmartInputState(this.score, new EntryChord(notesPressed.map(n => new EntryNote(Pitch.fromMidi(n), this.score.counter))));
    }
}

export class RestSmartInputState implements TapEntryState {
    constructor(private score: IEntryScore) {
        this.myRest = this.score.addRest(this.score.counter);
    }
    myRest: EntryRest;

    noteOn(pitch: number, notesPressed: number[]): TapEntryState {
        const res = new ChordSmartInputState(this.score, new EntryChord());
        res.noteOn(pitch, notesPressed);
        return res;
    }
    noteOff(pitch: number, notesPressed: number[]): TapEntryState {
        return this;
    }
    p1On(notesPressed: number[]): TapEntryState {
        this.myRest.duration = Time.addSpans(this.myRest.duration, this.score.counter);
        //console.log('pqon', this.myRest);

        return this;
    }
    p2On(notesPressed: number[]): TapEntryState {
        return this;
    }
}
