import { MusicEvent } from './sequence';

export interface VariableDef {
    id: string;
    value: FlexibleItem;
}

export interface VariableRef {
    variable: string;
}

export type FuncDef = 'Relative' | 'Reverse' | 'Repeat' | 'Grace' | 'Tuplet' | 'Transpose' | 'ModalTranspose';

export type FlexibleItem = string | SeqFunction | VariableRef | FlexibleItem[] | MusicEvent;

export interface SeqFunction {
    function: FuncDef;
    args: FlexibleItem;
    extraArgs?: unknown[];
}
