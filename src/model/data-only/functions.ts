import { SequenceDef } from './voices';

export type FuncDef = 'Identity' | 'Relative' | 'Reverse' | 'Repeat' | 'Grace' | 'Tuplet' | 'Transpose' | 'ModalTranspose' 
| 'AddLyrics' | 'Augment' | 'Tremolo' | 'Invert' | 'UpdateNote';



export interface SeqFunction {
    function: FuncDef;
    args: SequenceDef;
    extraArgs?: unknown[];
}



export function isSeqFunction(test: unknown): test is SeqFunction {
    return !!test && !!(test as SeqFunction).function && !!(test as SeqFunction).args;
}

export function isFuncDef(test: string): test is FuncDef {
    return ['Identity', 'Relative', 'Reverse', 'Repeat', 'Grace', 'Tuplet', 'Transpose', 
        'ModalTranspose', 'AddLyrics', 'Augment', 'Tremolo', 'Invert', 'UpdateNote'].includes(test);
}
