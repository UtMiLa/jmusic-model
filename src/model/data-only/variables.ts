import { FlexibleItem } from './..';
import { SequenceDef } from './voices';

export interface VariableDef {
    id: string;
    value: SequenceDef;
}

export interface VarDict {
    [key: string]: FlexibleItem// todo: Get rid of this!
}


export interface VariableRef {
    variable: string;
}
