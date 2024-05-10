import { VariableRef } from './variables';
import { NoteDef, NoteDirection } from './notes';
import { SeqFunction } from './functions';
import { LongDecorationElement } from './decorations';

export type SequenceItem = string | SeqFunction | VariableRef | NoteDef | LongDecorationElement | SequenceDef | SplitSequenceDef;

export type MultiSequenceItem = SequenceItem | SplitSequenceDef;

export type VoiceContentDef = MultiSequenceDef;


export type SequenceDef = string | SequenceItem[];
export type MultiSequenceDef = string | MultiSequenceItem[] | SplitSequenceDef;

export interface VoiceDef {
    contentDef: VoiceContentDef;
    noteDirection?: NoteDirection;
}

export interface SplitSequenceDef {
    type: 'multi';
    sequences: SequenceDef[]; // should we allow MultiSequenceDef with all that mess?
}

export function isSplitSequence(test: unknown): test is SplitSequenceDef {
    return !!test && (test as SplitSequenceDef).type === 'multi';
}
