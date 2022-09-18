import { Clef } from './../../model/states/clef';
import { NoteType, NoteDirection, Note } from '../../model/notes/note';
export interface NoteViewModel {
    positions: number[];
    noteType: NoteType;
    direction: NoteDirection;
}

export function noteToView(note: Note, clef: Clef): NoteViewModel {
    const positions = note.pitches.map(p => clef.map(p)).sort();
    let direction = note.direction;
    if (direction === NoteDirection.Undefined) {
        const middlePos2 = positions[0] + positions[positions.length - 1];
        direction = middlePos2 <= 0 ? NoteDirection.Up : NoteDirection.Down;
    }
    return {
        positions,
        noteType: note.type,
        direction
    };
}