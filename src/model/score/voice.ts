import { NoteDirection } from './../notes/note';
import { Sequence, SequenceDef } from './sequence';
import { AbsoluteTime } from './../rationals/time';
  

export interface VoiceDef {
    content: SequenceDef;
    noteDirection?: NoteDirection;
}

