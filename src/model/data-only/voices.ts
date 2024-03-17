import { VariableRef } from './variables';
import { NoteDef, NoteDirection } from './notes';
import { SeqFunction } from './functions';
import { MusicEvent } from '../score/sequence';

export type SequenceItem = string | SeqFunction | VariableRef | NoteDef | SequenceDef | SplitSequenceDef;

//export type SequenceDef = string | SequenceItem[];

//export type MultiSequenceDef = SequenceDef;
export type FlexibleItem = string | SeqFunction | VariableRef | FlexibleItem[] | MusicEvent | SplitSequenceDef;// todo: Get rid of FlexibleItem and MusicEvent
export type MultiFlexibleItem = FlexibleItem | MultiFlexibleItem[] | SplitSequenceDef;
export type MultiSequenceItem = SequenceItem | SplitSequenceDef;

export type VoiceContentDef = MultiSequenceDef;
export type VoiceContent = VoiceContentDef | MultiSequence;

/*export type MultiFlexibleItem = SequenceItem;
export type FlexibleItem = SequenceItem;*/

export type SequenceDef = string | SequenceItem[];
export type FlexibleSequenceDef = SequenceDef | FlexibleItem[];
export type MultiSequenceDef = string | MultiSequenceItem[] | SplitSequenceDef;

//export type MultiSequenceDef = string | MultiFlexibleItem[];
export interface VoiceDef {
    contentDef: VoiceContentDef;
    noteDirection?: NoteDirection;
}

export interface SplitSequenceDef {
    type: 'multi';
    sequences: SequenceDef[]; // should we allow MultiSequenceDef with all that mess?
}

export interface MultiSequence {
    type: 'multi';
    sequences: FlexibleItem[]; // should we allow MultiFlexibleItem with all that mess?
}

export function isSplitSequence(test: unknown): test is SplitSequenceDef {
    return !!test && (test as SplitSequenceDef).type === 'multi';
}
