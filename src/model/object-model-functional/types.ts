import { FuncDef } from '../data-only/functions';
import { TimeSpan } from '../rationals/time';
import { MusicEvent } from '../score/sequence';

// todo: Find a better name than "Conceptual"

export interface ConceptualVarRef {
    name: string;
    items: ConceptualSequence;
    readonly duration: TimeSpan;
}

export interface ConceptualFunctionCall {
    name: string;
    func: FuncDef;
    items: ConceptualSequence;
    readonly duration: TimeSpan;
}

export type ConceptualSequenceItem = MusicEvent | ConceptualVarRef | ConceptualFunctionCall;

export type ConceptualSequence = ConceptualSequenceItem[];

