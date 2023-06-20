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

export type FuncDef = 'Relative' | 'Reverse' | 'Repeat' | 'Grace' | 'Tuplet' | 'Transpose' | 'ModalTranspose' | 'AddLyrics';

export type FlexibleItem = string | SeqFunction | VariableRef | FlexibleItem[] | MusicEvent;

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
