import { Rational } from './../../model/rationals/rational';
import { Clef } from './../../model/states/clef';
import { NoteType, NoteDirection, Note } from '../../model/notes/note';

export enum FlagType {
    None,
    F1,
    F2,
    F3,
    F4,
    F5
}
export interface NoteViewModel {
    positions: number[];
    noteType: NoteType;
    direction: NoteDirection;
    flagType?: FlagType;
}

export function noteToView(note: Note, clef: Clef): NoteViewModel {
    const positions = note.pitches.map(p => clef.map(p)).sort();
    let direction = note.direction;
    if (direction === NoteDirection.Undefined) {
        const middlePos2 = positions[0] + positions[positions.length - 1];
        direction = middlePos2 <= 0 ? NoteDirection.Up : NoteDirection.Down;
    }
    let flagType = FlagType.None;
    if (note.duration.denominator >= 8) {
        switch (note.duration.denominator) {
            case 8: flagType = FlagType.F1; break;
            case 16: flagType = FlagType.F2; break;
            case 32: flagType = FlagType.F3; break;
            case 64: flagType = FlagType.F4; break;
            case 128: flagType = FlagType.F5; break;
            default: flagType = FlagType.None; throw 'Illegal duration: ' + Rational.toString(note.duration); break;
        }
    }
    return {
        positions,
        noteType: note.type,
        direction,
        flagType
    };
}