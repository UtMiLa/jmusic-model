import { Rational } from './../../model';
import { Clef } from './../../model';
import { NoteDirection, Note } from '../../model';
import { FlagType, NoteViewModel } from './note-view-model';

export function noteToView(note: Note, clef: Clef): NoteViewModel {
    const positions = note.pitches.map(p => clef.map(p)).sort();
    let direction = note.direction;
    if (!direction) {
        const middlePos2 = positions[0] + positions[positions.length - 1];
        direction = middlePos2 <= 0 ? NoteDirection.Up : NoteDirection.Down;
    }
    let flagType = FlagType.None;

    const duration = note.undottedDuration;

    if (duration.denominator >= 8) {
        switch (duration.denominator) {
            case 8: flagType = FlagType.F1; break;
            case 16: flagType = FlagType.F2; break;
            case 32: flagType = FlagType.F3; break;
            case 64: flagType = FlagType.F4; break;
            case 128: flagType = FlagType.F5; break;
            default: flagType = FlagType.None; throw 'Illegal duration: ' + Rational.toString(note.duration); break;
        }
    }
    const res: NoteViewModel = {
        positions,
        noteType: note.type,
        direction,
        flagType
    };

    if (note.dotNo) res.dotNo = note.dotNo;
    if (note.uniq) res.uniq = note.uniq;

    return res;
}