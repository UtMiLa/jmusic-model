import { NoteDirection } from './../notes/note';
import { FlexibleSequence } from './flexible-sequence';
import { ISequence, SequenceDef } from './sequence';
import { FlexibleItem } from './types';
import { VariableRepository } from './variables';


export type VoiceContentDef = SequenceDef; 
export interface VoiceDef {
    contentDef: VoiceContentDef;
    noteDirection?: NoteDirection;
}

export interface Voice {
    content: ISequence;
    noteDirection?: NoteDirection;
}

export function voiceContentToSequence(content: VoiceContentDef, repo?: VariableRepository): ISequence {
    return new FlexibleSequence(content as FlexibleItem, repo);
}

export function voiceDefToVoice(voiceDef: VoiceDef, repo?: VariableRepository): Voice[] {
    return [{
        content: voiceContentToSequence(voiceDef.contentDef, repo),
        noteDirection: voiceDef.noteDirection
    }];
}

export function voiceSequenceToDef(seq: ISequence): VoiceContentDef {
    return seq.asObject;
}
