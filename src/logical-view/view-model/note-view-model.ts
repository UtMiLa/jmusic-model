import { NoteType, NoteDirection } from '../../model/notes/note';
export interface NoteViewModel {
    positions: number[];
    noteType: NoteType;
    direction: NoteDirection;
}
