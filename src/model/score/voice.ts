import { MultiFlexibleItem, VoiceContentDef } from '..';
import { FlexibleSequence } from './flexible-sequence';
import { MultiFlexibleSequence } from './multi-flexible-sequence';
import { ISequence } from './sequence';
import { SplitSequenceDef } from '..';
import { VariableRepository } from './variables';
import { VoiceDef } from '../data-only/voices';
import { NoteDirection } from '../data-only/notes';


/*export type VoiceContentDef = MultiSequenceDef | MultiSequence; 
export interface VoiceDef {
    contentDef: VoiceContentDef;
    noteDirection?: NoteDirection;
}*/

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
        ...(
            seqCount === 1 
                ? (voiceDef.noteDirection === undefined ? {} : {noteDirection: voiceDef.noteDirection})
                : idx === 0 
                    ? {noteDirection: NoteDirection.Up} 
                    : {noteDirection: NoteDirection.Down}
        ) 
        
    }));
}

export function voiceSequenceToDef(seq: ISequence): VoiceContentDef {
    return seq.asObject;
}
