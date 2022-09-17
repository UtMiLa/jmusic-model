import { NoteType, NoteDirection } from './../notes/note';
export interface NoteViewModel {
    positions: number[];
    noteType: NoteType;
    direction: NoteDirection;
}
