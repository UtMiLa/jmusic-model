import { NoteDirection } from './../notes/note';
import { FlexibleSequence } from './flexible-sequence';
import { MultiFlexibleSequence } from './multi-flexible-sequence';
import { ISequence, SequenceDef } from './sequence';
import { FlexibleItem, MultiSequence, MultiFlexibleItem } from './types';
import { VariableRepository } from './variables';


export type VoiceContentDef = SequenceDef | MultiSequence; 
export interface VoiceDef {
    contentDef: VoiceContentDef;
    noteDirection?: NoteDirection;
}

export interface Voice {
    content: ISequence;
    noteDirection?: NoteDirection;
}

export function voiceContentToSequence(content: VoiceContentDef, repo?: VariableRepository): ISequence[] {
    return new MultiFlexibleSequence(content as MultiFlexibleItem, repo).seqs;
}

export function voiceDefToVoice(voiceDef: VoiceDef, repo?: VariableRepository): Voice[] {
    const seq = voiceContentToSequence(voiceDef.contentDef, repo);
    const seqCount = seq.length;
    //console.log('seq', seq);
    
    return seq.map((seq, idx) => ({
        content: seq,
        noteDirection: seqCount === 1 ? voiceDef.noteDirection : idx === 0 ? NoteDirection.Up : NoteDirection.Down
    }));
}

export function voiceSequenceToDef(seq: ISequence): VoiceContentDef {
    return seq.asObject;
}
