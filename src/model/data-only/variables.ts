import { FlexibleItem } from './..';
import { SequenceDef } from './voices';

export interface VariableDef {
    id: string;
    value: SequenceDef;
}

export interface VarDict {
    [key: string]: FlexibleItem// SequenceDef
}


export interface VariableRef {
    variable: string;
}
