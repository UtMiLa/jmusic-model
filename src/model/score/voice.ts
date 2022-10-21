import { NoteDirection } from './../notes/note';
import { ISequence } from './sequence';
  

export interface VoiceDef {
    content: ISequence;
    noteDirection?: NoteDirection;
}

