import { ActiveSequence } from '../active-project/types';
import { FlexibleItem, MusicEvent } from './..';
import { SequenceDef, VoiceContentDef } from './voices';

export interface VariableDef {
    id: string;
    value: SequenceDef;
}

export interface VarDictFlex {
    [key: string]: FlexibleItem
}

export interface VarDictDef {
    [key: string]: VoiceContentDef
}

export interface VarDictActive {
    [key: string]: ActiveSequence
}

export interface VariableRef {
    variable: string;
}
