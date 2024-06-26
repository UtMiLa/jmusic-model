import { ElementIdentifier } from '../../selection/selection-types';
import { FuncDef } from '../data-only/functions';
import { NoteDirection } from '../data-only/notes';
import { TimeSpan } from '../rationals/time';
import { MusicEvent, isMusicEvent } from '../score/sequence';
import { Clef } from '../states/clef';
import { Key } from '../states/key';
import { Meter } from '../states/meter';
import { PathElement } from '../score/flexible-sequence';
import { VarDictActive } from '../data-only/variables';
import { RepeatDef } from '../score/repeats';

export interface ActiveVarRef {
    type: 'VarRef';
    name: string;
    items: ActiveSequence;
    readonly duration: TimeSpan;
}

export interface ActiveFunctionCall {
    type: 'Func';
    name: FuncDef;
    /*func?: (element: MusicEvent[]) => MusicEvent[];
    inverse?: (element: MusicEvent[]) => MusicEvent[];*/
    items: ActiveSequence;
    extraArgs?: any[];
    readonly duration: TimeSpan;
}

export type ActiveSequenceItem = MusicEvent | ActiveVarRef | ActiveFunctionCall | ActiveSequence;

export type ActiveSequence = ActiveSequenceItem[];

export interface ActiveVoice {
    content: ActiveSequence;
    noteDirection?: NoteDirection;
}

export interface ActiveStaff {
    voices: ActiveVoice[];
    initialClef: Clef;
    initialKey: Key;
    initialMeter?: Meter;
}
export interface ActiveScore {
    staves: ActiveStaff[];
    repeats?: RepeatDef[];
}

export type ActiveVarRepo = VarDictActive;

export interface ActiveProject {
    score: ActiveScore;
    vars: ActiveVarRepo;
}

export interface ActiveVarsAnd<T> {
    vars: ActiveVarRepo;
    item: T
}

export interface FunctionPathItem {
    function: FuncDef;
    extraArgs?: any[];
    //index: number;
}

export interface ElementDescriptor {
    position: ElementIdentifier;
    path: PathElement<MusicEvent>[];
    element: MusicEvent;
    functionPath: FunctionPathItem[];
}

export function isActiveVarRef(item: ActiveSequenceItem): item is ActiveVarRef {
    return (item as ActiveVarRef).type === 'VarRef';
}

export function isActiveFunctionCall(item: ActiveSequenceItem): item is ActiveFunctionCall {
    return (item as ActiveFunctionCall).type === 'Func';
}

export function isActiveMusicEvent(item: ActiveSequenceItem): item is MusicEvent {
    return isMusicEvent(item);
}

