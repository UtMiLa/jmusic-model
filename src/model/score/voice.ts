import { NoteDirection } from './../notes/note';
import { FlexibleItem, FlexibleSequence } from './flexible-sequence';
import { ISequence, SequenceDef } from './sequence';


export type VoiceContentDef = ISequence; // ideal: SequenceDef; 
export interface VoiceDef {
    content: VoiceContentDef;
    noteDirection?: NoteDirection;
}

export function voiceContentToSequence(content: VoiceContentDef): ISequence {
    return content; // ideal: new FlexibleSequence(content as FlexibleItem);
}

export function voiceSequenceToDef(seq: ISequence): VoiceContentDef {
    return seq; // ideal: seq.asObject;
}
