import { FuncDef } from '../data-only/functions';
import { TimeSpan } from '../rationals/time';
import { MusicEvent, isMusicEvent } from '../score/sequence';

// todo: Find a better name than "Conceptual"

export interface ConceptualVarRef {
    type: 'VarRef';
    name: string;
    items: ConceptualSequence;
    readonly duration: TimeSpan;
}

export interface ConceptualFunctionCall {
    type: 'Func';
    name: string;
    func: FuncDef;
    items: ConceptualSequence;
    readonly duration: TimeSpan;
}

export type ConceptualSequenceItem = MusicEvent | ConceptualVarRef | ConceptualFunctionCall;

export type ConceptualSequence = ConceptualSequenceItem[];

export function isConceptualVarRef(item: ConceptualSequenceItem): item is ConceptualVarRef {
    return (item as ConceptualVarRef).type === 'VarRef';
}

export function isConceptualFunctionCall(item: ConceptualSequenceItem): item is ConceptualFunctionCall {
    return (item as ConceptualFunctionCall).type === 'Func';
}

export function isConceptualMusicEvent(item: ConceptualSequenceItem): item is MusicEvent {
    return isMusicEvent(item);
}