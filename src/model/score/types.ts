import { FuncDef, SeqFunction } from './../data-only/functions';
import { ScoreDef, SequenceDef, SplitSequenceDef, VariableRef, VoiceContentDef } from '..';
import { MusicEvent } from './sequence';

export type FlexibleItem = string | SeqFunction | VariableRef | FlexibleItem[] | MusicEvent | SplitSequenceDef;
export type MultiFlexibleItem = FlexibleItem | MultiFlexibleItem[] | SplitSequenceDef;
export type FlexibleSequenceDef = SequenceDef | FlexibleItem[];

export interface MultiSequence {
    type: 'multi';
    sequences: FlexibleItem[]; // should we allow MultiFlexibleItem with all that mess?
}
export type VoiceContent = VoiceContentDef | MultiSequence;
