import { Rational } from '../rationals/rational';
import { TimeSpan, Time } from '../rationals/time';
import { Pitch } from '../pitches/pitch';


export enum NoteType {
    NBreve = 1, NWhole, NHalf, NQuarter
}

export enum NoteDirection {
    Undefined = 0, Up = 1, Down = 2
}

export class Note {
    
    static clone(note: Note, arg1: { [key: string]: any } = {}): Note {        
        const res = new Note(note._pitches, note._duration);

        Object.keys(arg1).forEach(key => (res as any)[key] = arg1[key]);

        return res;
    }

    constructor(private _pitches: Pitch[], private _duration: TimeSpan) {
        //console.log('new note', _pitch, _duration);
        
    }
    static parseLily(input: string): Note {
        const matcher = /([a-g](es|is)*[',]*)(\d+\.*)/i;
        const matcherChord = /<([a-z,' ]+)>(\d+\.*)/i;
        const matchChord = matcherChord.exec(input);

        let pitches = [] as string[];
        let durationString = '';

        if (matchChord) {
            //console.log(matchChord);
            pitches = matchChord[1].split(' ');
            durationString = matchChord[2];
        } else {
            const match = matcher.exec(input);
            if (!match || match.length < 4) throw 'Illegal note: ' + input;
            pitches = [match[1]];
            durationString = match[3];    
        }
        //console.log(match);
        
        return new Note(pitches.map(pitch => Pitch.parseLilypond(pitch)), Time.fromLilypond(durationString));
    }

    get pitches(): Pitch[] {
        return this._pitches;
    }

    get duration(): TimeSpan {
        return this._duration;
    }

    get type(): NoteType {
        if (Rational.value(this.duration) >= 2) 
            return NoteType.NBreve;
        switch (this.duration.denominator) {
            case 1: return NoteType.NWhole;
            case 2: return NoteType.NHalf;
            default: return NoteType.NQuarter;
        }
    }

    direction: NoteDirection = NoteDirection.Undefined;
}