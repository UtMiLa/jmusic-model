import { NoteExpression, parseLilyNoteExpression } from './note-expressions';
import { RationalDef } from '../../model/rationals/rational';
import { Rational } from '../rationals/rational';
import { TimeSpan, Time } from '../rationals/time';
import { Pitch } from '../pitches/pitch';
import { mergeRight } from 'ramda';


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

export type Note = Readonly<{
    pitches: Pitch[];
    duration: TimeSpan;
    nominalDuration: TimeSpan;
    dotNo: number;
    tupletFactor?: RationalDef;
    tupletGroup?: TupletState;
    direction: NoteDirection;
    tie?: boolean;
    uniq?: string;
    expressions?: NoteExpression[];
    text?: string[];
    grace?: boolean;
}>;



export interface UpdateNote {
    pitches?: Pitch[];
    duration?: TimeSpan;
    nominalDuration?: TimeSpan;
    dotNo?: number;
    tupletFactor?: RationalDef;
    tupletGroup?: TupletState;
    direction?: NoteDirection;
    tie?: boolean;
    uniq?: string;
    expressions?: NoteExpression[];
    text?: string[];
    grace?: boolean;
}



export function createNoteFromLilypond(input: string): Note {
    
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
    const res = createNote(pitches.map(pitch => Pitch.parseLilypond(pitch)), Time.fromLilypond(durationString));
    const extra: UpdateNote = {};
    if (tie) extra.tie = tie;
    if (expressions.length) extra.expressions = expressions.map(expression => parseLilyNoteExpression(expression));
    
    /*res.duration = getRealDuration(res);
    res.dotNo = getDotNo(res);*/


    return cloneNote(res, extra);
}

export function cloneNote(note: Note,  changeProperties: UpdateNote): Note {
    /*const res = createNote(note.pitches, getNominalDuration(note));
    let extra: UpdateNote = res;
    if (note.uniq) extra.uniq = note.uniq;
    if (note.tupletFactor) extra.tupletFactor = note.tupletFactor;
    if (note.tie) extra.tie = note.tie;
    if (note.direction) extra.direction = note.direction;
    if (note.grace) extra.grace = note.grace;
    if (note.tupletGroup) extra.tupletGroup = note.tupletGroup;
    if (note.expressions) extra.expressions = [...note.expressions];
    if (note.text) extra.text = [...note.text];*/

    //Object.keys(changeProperties).forEach(key => (extra as any)[key] = (changeProperties as any)[key]);

    //extra = {...extra, changeProperties};
    const extra = mergeRight(note, changeProperties);
    extra.duration = getRealDuration(extra); // todo: make setter function for duration-related stuff (like grace and tuplet notes)
    extra.dotNo = getDotNo(extra);


    return extra as Note;
}

export function getDotNo(note: Note): number {
    return Time.getDotNo(note.nominalDuration.numerator);
}

export function createNote(pitches: Pitch[], duration: TimeSpan): Note {
    const note0: Note = {
        pitches: pitches,
        nominalDuration: duration,
        duration: duration,
        dotNo: 0,
        direction: NoteDirection.Undefined
    };

    const note: Note = {
        pitches: pitches,
        nominalDuration: duration,
        direction: NoteDirection.Undefined,
        duration: getRealDuration(note0),
        dotNo: getDotNo(note0)
    };

    //return new NoteInst(pitches, duration);

    return note;
}

export function getNoteType(note: Note): NoteType {
    const nominalDuration = getNominalDuration(note);
    const undottedDuration = getUndottedDuration(note);
    if (!note.pitches.length) {
        switch (undottedDuration.denominator) {
            case 1: {
                if (undottedDuration.numerator === 1) return NoteType.RWhole;
                if (undottedDuration.numerator === 2) return NoteType.RBreve;
                throw 'Illegal numerator: ' + undottedDuration.numerator;
            }
            case 2: return NoteType.RHalf;
            case 4: return NoteType.RQuarter;
            case 8: return NoteType.R8;
            case 16: return NoteType.R16;
            case 32: return NoteType.R32;
            case 64: return NoteType.R64;
            case 128: return NoteType.R128;
            default: throw 'Illegal denominator: ' + undottedDuration.denominator;
        }

    }
    if (Rational.value(nominalDuration) >= 2) 
        return NoteType.NBreve;
    switch (undottedDuration.denominator) {
        case 1: return NoteType.NWhole;
        case 2: return NoteType.NHalf;
        default: return NoteType.NQuarter;
    }
}

export function getRealDuration(note: Note): TimeSpan {
    if (note.grace) return Time.NoTime;
    if (note.tupletFactor) {
        return {...Rational.multiply(note.nominalDuration, note.tupletFactor), type: 'span'};
    } else {
        return note.nominalDuration;
    }
    
}

export function getNominalDuration(note: Note): TimeSpan {
    return note.nominalDuration;
}

export function getUndottedDuration(note: Note): TimeSpan {
    const nominalDuration = getNominalDuration(note);
    if (nominalDuration.denominator === 1 && nominalDuration.numerator === 2) {
        return nominalDuration; // todo: what if 6/1? but we have no longa yet
    }
    return Time.scale(
        Time.addSpans(nominalDuration, Time.newSpan(1, nominalDuration.denominator)),
        1, 2
    );
}
