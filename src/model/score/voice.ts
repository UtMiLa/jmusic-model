import { NoteDirection } from './../notes/note';
import { FlexibleSequence } from './flexible-sequence';
import { ISequence, SequenceDef } from './sequence';
import { FlexibleItem } from './types';


export type VoiceContentDef = SequenceDef; 
export interface VoiceDef {
    content: VoiceContentDef;
    noteDirection?: NoteDirection;
}

export function voiceContentToSequence(content: VoiceContentDef): ISequence {
    return new FlexibleSequence(content as FlexibleItem);
}

export function voiceSequenceToDef(seq: ISequence): VoiceContentDef {
    return seq.asObject;
}
