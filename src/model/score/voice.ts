import { NoteDirection } from './../notes/note';
import { FlexibleSequence } from './flexible-sequence';
import { ISequence, SequenceDef } from './sequence';
import { FlexibleItem } from './types';
import { VariableRepository } from './variables';


export type VoiceContentDef = SequenceDef; 
export interface VoiceDef {
    content: VoiceContentDef;
    noteDirection?: NoteDirection;
}

export function voiceContentToSequence(content: VoiceContentDef, repo?: VariableRepository): ISequence {
    return new FlexibleSequence(content as FlexibleItem, repo);
}

export function voiceSequenceToDef(seq: ISequence): VoiceContentDef {
    return seq.asObject;
}
