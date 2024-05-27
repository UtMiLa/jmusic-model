import { ElementIdentifier } from './../../selection/selection-types';
import { FuncDef } from '../data-only/functions';
import { NoteDirection } from '../data-only/notes';
import { TimeSpan } from '../rationals/time';
import { MusicEvent, isMusicEvent } from '../score/sequence';
import { Clef } from '../states/clef';
import { Key } from '../states/key';
import { Meter } from '../states/meter';

export interface ActiveVarRef {
    type: 'VarRef';
    name: string;
    items: ActiveSequence;
    readonly duration: TimeSpan;
}

export interface ActiveFunctionCall {
    type: 'Func';
    name: string;
    func: FuncDef;
    items: ActiveSequence;
    extraArgs: any[];
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
}

export interface ActiveVarRepo {
    [key: string]: ActiveSequence;
}

export interface ActiveProject {
    score: ActiveScore;
    vars: ActiveVarRepo;
}

export interface ActiveVarsAnd<T> {
    vars: ActiveVarRepo;
    item: T
}

export interface ElementDescriptor {
    position: ElementIdentifier;
    element: MusicEvent;
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

