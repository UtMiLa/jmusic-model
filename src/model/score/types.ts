import { ScoreDef } from './score';
import { MusicEvent } from './sequence';

export interface VariableDef {
    id: string;
    value: FlexibleItem;
}

export interface VarDict {
    [key: string]: FlexibleItem
}


export interface VariableRef {
    variable: string;
}

export type FuncDef = 'Identity' | 'Relative' | 'Reverse' | 'Repeat' | 'Grace' | 'Tuplet' | 'Transpose' | 'ModalTranspose' | 'AddLyrics';

export interface MultiSequence {
    type: 'multi';
    sequences: FlexibleItem[]; // should we allow MultiFlexibleItem with all that mess?
}

export function isMultiSequence(test: unknown): test is MultiSequence {
    return !!test && (test as MultiSequence).type === 'multi';
}


export type FlexibleItem = string | SeqFunction | VariableRef | FlexibleItem[] | MusicEvent;
export type MultiFlexibleItem = FlexibleItem | MultiFlexibleItem[] | MultiSequence;


export interface SeqFunction {
    function: FuncDef;
    args: FlexibleItem;
    extraArgs?: unknown[];
}

export function isSeqFunction(test: unknown): test is SeqFunction {
    return !!test && !!(test as SeqFunction).function && !!(test as SeqFunction).args;
}


export interface ProjectDef {
    score: ScoreDef;
    vars: VarDict;
}

export function isProjectDef(test: unknown): test is ProjectDef {
    return !!test && !!(test as ProjectDef).score && !!(test as ProjectDef).vars;
}
