import { NoteDirection } from './../notes/note';
import { FlexibleSequence } from './flexible-sequence';
import { ISequence, SequenceDef } from './sequence';



export interface VoiceDef {
    content: ISequence;
    noteDirection?: NoteDirection;
}

export function voiceContentToSequence(content: ISequence): ISequence {
    return content; // new FlexibleSequence(content.elements);
}