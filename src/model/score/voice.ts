import { NoteDirection } from './../notes/note';
import { SequenceDef } from './sequence';
export interface VoiceDef {
    content: SequenceDef;
    noteDirection?: NoteDirection;
}