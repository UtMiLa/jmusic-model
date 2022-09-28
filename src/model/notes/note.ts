import { Rational } from '../rationals/rational';
import { TimeSpan, Time } from '../rationals/time';
import { Pitch } from '../pitches/pitch';


export enum NoteType {
    NBreve = 1, NWhole, NHalf, NQuarter,
    RBreve, RWhole, RHalf, RQuarter, R8, R16, R32, R64, R128
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
        const matcher = /([a-gr](es|is)*[',]*)(\d+\.*)(~?)/i;
        const matcherChord = /<([a-z,' ]+)>(\d+\.*)(~?)/i;
        const matchChord = matcherChord.exec(input);

        let pitches = [] as string[];
        let durationString = '';
        let tie = false;

        if (matchChord) {
            //console.log(matchChord);
            pitches = matchChord[1].split(' ');
            durationString = matchChord[2];
            if (matchChord[3] === '~') {
                tie = true;
            }
        } else {
            const match = matcher.exec(input);
            if (!match || match.length < 4) throw 'Illegal note: ' + input;
            pitches = (match[1] === 'r') ? [] : [match[1]];
            durationString = match[3];    
            if (match[4] === '~') {
                tie = true;
            }
        }
        //console.log(match);
        const res = new Note(pitches.map(pitch => Pitch.parseLilypond(pitch)), Time.fromLilypond(durationString));
        if (tie) res.tie = tie;
        return res;
    }

    get pitches(): Pitch[] {
        return this._pitches;
    }

    get duration(): TimeSpan {
        return this._duration;
    }

    get dotNo(): number {
        return Time.getDotNo(this.duration.numerator);
    }

    get undottedDuration(): TimeSpan {        
        return Time.scale(
            Time.addSpans(this.duration, Time.newSpan(1, this.duration.denominator)),
            1, 2
        );
    }

    get type(): NoteType {
        if (!this.pitches.length) {
            switch (this.undottedDuration.denominator) {
                case 1: return NoteType.RWhole;
                case 2: return NoteType.RHalf;
                case 4: return NoteType.RQuarter;
                case 8: return NoteType.R8;
                case 16: return NoteType.R16;
                case 32: return NoteType.R32;
                case 64: return NoteType.R64;
                case 128: return NoteType.R128;
                default: throw 'Illegal denominator: ' + this.undottedDuration.denominator;
            }
    
        }
        if (Rational.value(this.duration) >= 2) 
            return NoteType.NBreve;
        switch (this.undottedDuration.denominator) {
            case 1: return NoteType.NWhole;
            case 2: return NoteType.NHalf;
            default: return NoteType.NQuarter;
        }
    }

    direction: NoteDirection = NoteDirection.Undefined;
    tie?: boolean;
}