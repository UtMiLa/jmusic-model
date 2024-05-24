import { FuncDef } from '../data-only/functions';
import { TimeSpan } from '../rationals/time';
import { MusicEvent, isMusicEvent } from '../score/sequence';

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

export function isActiveVarRef(item: ActiveSequenceItem): item is ActiveVarRef {
    return (item as ActiveVarRef).type === 'VarRef';
}

export function isActiveFunctionCall(item: ActiveSequenceItem): item is ActiveFunctionCall {
    return (item as ActiveFunctionCall).type === 'Func';
}

export function isActiveMusicEvent(item: ActiveSequenceItem): item is MusicEvent {
    return isMusicEvent(item);
}