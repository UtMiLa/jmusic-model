import { NoteExpression, parseLilyNoteExpression } from './note-expressions';
import { RationalDef } from '../../model/rationals/rational';
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

export enum TupletState {
    None, Begin, Inside, End
}

export class Note {
    static clone(note: Note, changeProperties: { [key: string]: any } = {}): Note {        
        const res = new Note(note._pitches, note._duration);
        if (note.uniq) res.uniq = note.uniq;
        if (note.tupletFactor) res.tupletFactor = note.tupletFactor;
        if (note.tie) res.tie = note.tie;
        if (note.direction) res.direction = note.direction;
        if (note.tupletGroup) res.tupletGroup = note.tupletGroup;

        Object.keys(changeProperties).forEach(key => (res as any)[key] = changeProperties[key]);

        return res;
    }

    constructor(private _pitches: Pitch[], private _duration: TimeSpan) {
        //console.log('new note', _pitch, _duration);        
    }

    static parseLily(input: string): Note {
        const matcher = /^([a-gr](es|is)*[',]*)(\d+\.*)((\\[a-z]+)*)(~?)$/i;
        const matcherChord = /^<([a-z,' ]+)>(\d+\.*)((\\[a-z]+)*)(~?)$/i;
        const matchChord = matcherChord.exec(input);

        let pitches = [] as string[];
        let durationString = '';
        let expressions = [] as string[];
        let tie = false;

        if (matchChord) {
            //console.log(matchChord);
            pitches = matchChord[1].split(' ');
            durationString = matchChord[2];
            if (matchChord[3]) {
                expressions = matchChord[3].split(/(?=\\)/);
            }
            if (matchChord[5] === '~') {
                tie = true;
            }
        } else {
            const match = matcher.exec(input);
            if (!match || match.length < 4) throw 'Illegal note: ' + input;
            pitches = (match[1] === 'r') ? [] : [match[1]];
            durationString = match[3];    
            if (match[4]) {
                expressions = (match[4]).split(/(?=\\)/);
            }
            if (match[6] === '~') {
                tie = true;
            }
        }
        //console.log(match);
        const res = new Note(pitches.map(pitch => Pitch.parseLilypond(pitch)), Time.fromLilypond(durationString));
        if (tie) res.tie = tie;        
        if (expressions.length) res.expressions = expressions.map(expression => parseLilyNoteExpression(expression));
        return res;
    }

    get pitches(): Pitch[] {
        return this._pitches;
    }

    get duration(): TimeSpan {
        if (this.tupletFactor) {
            return {...Rational.multiply(this._duration, this.tupletFactor), type: 'span'};
        } else {
            return this._duration;
        }
        
    }

    get nominalDuration(): TimeSpan {
        return this._duration;
    }

    tupletFactor?: RationalDef;
    tupletGroup?: TupletState;

    get dotNo(): number {
        return Time.getDotNo(this.nominalDuration.numerator);
    }

    get undottedDuration(): TimeSpan {        
        if (this.nominalDuration.denominator === 1 && this.nominalDuration.numerator === 2) {
            return this.nominalDuration; // todo: what if 6/1? but we have no longa yet
        }
        return Time.scale(
            Time.addSpans(this.nominalDuration, Time.newSpan(1, this.nominalDuration.denominator)),
            1, 2
        );
    }

    get type(): NoteType {
        if (!this.pitches.length) {
            switch (this.undottedDuration.denominator) {
                case 1: {
                    if (this.undottedDuration.numerator === 1) return NoteType.RWhole;
                    if (this.undottedDuration.numerator === 2) return NoteType.RBreve;
                    throw 'Illegal numerator: ' + this.undottedDuration.numerator;
                }
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
        if (Rational.value(this.nominalDuration) >= 2) 
            return NoteType.NBreve;
        switch (this.undottedDuration.denominator) {
            case 1: return NoteType.NWhole;
            case 2: return NoteType.NHalf;
            default: return NoteType.NQuarter;
        }
    }

    direction: NoteDirection = NoteDirection.Undefined;
    tie?: boolean;
    uniq?: string;
    expressions?: NoteExpression[];
}