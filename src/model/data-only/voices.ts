import { VariableRef } from './variables';
import { NoteDef, NoteDirection } from './notes';
import { SeqFunction } from './functions';
import { MusicEvent } from '../score/sequence';
import { MultiFlexibleSequence } from '../score/multi-flexible-sequence';

export type SequenceItem = NoteDef;

//export type SequenceDef = string | SequenceItem[];

//export type MultiSequenceDef = SequenceDef;
export type FlexibleItem = string | SeqFunction | VariableRef | FlexibleItem[] | MusicEvent/* | MultiSequence*/;
export type MultiFlexibleItem = FlexibleItem | MultiFlexibleItem[] | MultiSequence;

export type VoiceContentDef = MultiSequenceDef | MultiSequence;// todo: remove MultiSequence

/*export type MultiFlexibleItem = SequenceItem;
export type FlexibleItem = SequenceItem;*/

export type SequenceDef = string | FlexibleItem[];
export type MultiSequenceDef = string | MultiFlexibleItem[];

//export type MultiSequenceDef = string | MultiFlexibleItem[];
export interface VoiceDef {
    contentDef: VoiceContentDef;
    noteDirection?: NoteDirection;
}


export interface MultiSequence {
    type: 'multi';
    sequences: FlexibleItem[]; // should we allow MultiFlexibleItem with all that mess?
}

export function isMultiSequence(test: unknown): test is MultiSequence {
    return !!test && (test as MultiSequence).type === 'multi';
}
