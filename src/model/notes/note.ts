import { NoteExpression, parseLilyNoteExpression } from './note-expressions';
import { RationalDef } from '../../model/rationals/rational';
import { Rational } from '../rationals/rational';
import { TimeSpan, Time } from '../rationals/time';
import { Pitch } from '../pitches/pitch';
//import { mergeRight } from 'ramda';
import * as R from 'ramda';
import { getDotNumber, getUndottedValue } from '../rationals/dots';

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
    nominalDuration: TimeSpan;
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
    nominalDuration?: TimeSpan;
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
        if (!match || match.length < 4) {
            throw 'Illegal note: ' + input;
        }
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
    
    return cloneNote(res, extra);
}

export function cloneNote(note: Note,  changeProperties: UpdateNote): Note {

    const extra = R.mergeRight(note, changeProperties);


    return extra as Note;
}

const curryCloneNote = R.curry(cloneNote);

export const setNoteDirection = (note: Note, direction: NoteDirection) => (curryCloneNote(note)({ direction })) as Note;

export function setNoteText(note: Note,  text: string[] ): Note {
    return cloneNote(note, { text });
}

export function setNoteId(note: Note,  prefix: string, index: number): Note {
    return cloneNote(note, { uniq: prefix + '-' + index });
}
export function setGrace(note: Note, grace: boolean): Note {
    return cloneNote(note, { grace });
}
export function setTupletFactor(note: Note, tupletFactor: RationalDef | undefined): Note {
    return cloneNote(note, { tupletFactor });
}
export function setTupletGroup(note: Note, tupletGroup: TupletState): Note {
    return cloneNote(note, { tupletGroup });
}
export function setPitches(note: Note, pitches: Pitch[]): Note {
    return cloneNote(note, { pitches });
}
export function setDuration(note: Note, duration: TimeSpan): Note {
    return cloneNote(note, { nominalDuration: duration });
}

export function getDotNo(note: Note): number {
    return getDotNumber(note.nominalDuration);
}

export function createNote(pitches: Pitch[], duration: TimeSpan): Note {
    const note: Note = {
        pitches: pitches,
        nominalDuration: duration,
        direction: NoteDirection.Undefined
    };

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
    /*const nominalDuration = getNominalDuration(note);
    if (nominalDuration.denominator === 1 && nominalDuration.numerator === 2) {
        return nominalDuration; // todo: what if 6/1? but we have no longa yet
    }
    return Time.scale(
        Time.addSpans(nominalDuration, Time.newSpan(1, nominalDuration.denominator)),
        1, 2
    );*/
    return getUndottedValue(getNominalDuration(note));
}
