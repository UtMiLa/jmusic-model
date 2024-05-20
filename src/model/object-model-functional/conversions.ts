import { Time, TimeSpan } from './../rationals/time';
import R = require('ramda');
import { ProjectDef } from '../data-only/project';
import { VarDict, VariableRef } from '../data-only/variables';
import { MultiSequenceDef, VoiceContentDef } from '../data-only/voices';
import { flexibleItemToDef, recursivelySplitStringsIn } from '../score/flexible-sequence';
import { FlexibleItem } from '../score/types';
import { VariableRepository, createRepo, isVariableRef, valueOf } from '../score/variables';
import { ConceptualFunctionCall, ConceptualSequence, ConceptualSequenceItem, ConceptualVarRef, 
    isConceptualFunctionCall, isConceptualVarRef } from './types';
import { MusicEvent, getDuration, isMusicEvent, isNote, parseLilyElement } from '../score/sequence';
import { isSeqFunction, SeqFunction } from '../data-only/functions';
import { createFunction } from '../score/functions';
import { noteAsLilypond } from '../notes/note';
import { map } from 'fp-ts/Record';


function calcElements(items: FlexibleItem[], repo: VariableRepository): MusicEvent[] {
    return conceptualGetElements(requireElements(items, repo));
}
function isSingleStringArray(test: unknown): test is string[] {
    return (test as string[]).length === 1 && typeof ((test as string[])[0]) === 'string';
}

function isOtherFlexibleItemArray(test: unknown): test is FlexibleItem[] {
    return true;
}

function getDurationForConceptual(elem: ConceptualSequenceItem): TimeSpan {
    if (isConceptualVarRef(elem) || isConceptualFunctionCall(elem)) return elem.duration;
    if (R.is(Array, elem)) return elem.reduce((accu, child) => getDurationForConceptual(child), Time.NoTime);
    return getDuration(elem);
}

function requireElements(
    init: FlexibleItem[],
    repo: VariableRepository
): ConceptualSequence {
    
    const elements: ConceptualSequence = R.chain(
        R.cond([
            [
                R.is(String),
                ((item: string): ConceptualSequenceItem[] => item ? [parseLilyElement(item) as MusicEvent] : [])
            ],                    
            /*[
                isMultiSequence,
                (item: MultiSequence) => R.flatten(item.sequences.map(subSeq => calcElements([subSeq], this.repo)))
            ],*/
            [
                isSeqFunction,
                (item: SeqFunction) => { 
                    const elems = requireElements([item.args], repo);
                    const funcRes = createFunction(item.function, item.extraArgs)(calcElements([item.args], repo));
                    const duration = funcRes.reduce((prev, curr) => Time.addSpans(prev, getDurationForConceptual(curr)), Time.NoTime);
                    return [{
                        type: 'Func',
                        func: item.function,
                        items: elems,
                        extraArgs: item.extraArgs,
                        duration
                    } as ConceptualSequenceItem];
                }
            ],
            [
                isVariableRef,
                (item: VariableRef) => { 
                    const varRes = requireElements(valueOf(repo, item.variable).elements, repo);
                    const duration = varRes.reduce((prev, curr) => Time.addSpans(prev, getDurationForConceptual(curr)), Time.NoTime);
                    return [{ 
                        type: 'VarRef',
                        name: item.variable, 
                        items: varRes, 
                        duration
                    }] as ConceptualSequenceItem[];
                }
            ],
            [
                isSingleStringArray,
                (item: string[]) => [parseLilyElement(item[0])] as ConceptualSequenceItem[]
            ],
            [
                isMusicEvent, (item: MusicEvent) => [item as ConceptualSequenceItem]
            ],
            [
                isOtherFlexibleItemArray, (elm) => requireElements(elm, repo) as ConceptualSequenceItem[]
            ]
        ]),
        init);
    
    return elements;
}




//export function convertDataToConceptual(data: ProjectDef): Conce {}

export function convertSequenceItemToConceptual(data: MusicEvent, vars: VarDict): ConceptualSequenceItem {
    return requireElements(recursivelySplitStringsIn(data, createRepo(vars)), createRepo(vars))[0]; // todo: this should be possible to do nicer
}


export function convertSequenceDataToConceptual(data: VoiceContentDef, vars: VarDict): ConceptualSequence {
    return requireElements(recursivelySplitStringsIn(data, createRepo(vars)), createRepo(vars));
}


export function convertConceptualSequenceToData(conceptual: ConceptualSequence): VoiceContentDef {
    return conceptual.map(elem => {
        if (isConceptualVarRef(elem)) {
            return { variable: elem.name };
        } else if (isConceptualFunctionCall(elem)) {
            const res = { function: elem.func, args: convertConceptualSequenceToData(elem.items) } as SeqFunction;
            if (elem.extraArgs) res.extraArgs = elem.extraArgs;
            return res;
        } else if (R.is(Array, elem)) {
            return convertConceptualSequenceToData(elem);
        } else {
            if (isNote(elem)) {
                return noteAsLilypond(elem);
            }
        }
        throw 'Unknown object';
    });
}

export function conceptualGetElements(conceptual: ConceptualSequence): MusicEvent[] {
    return R.chain(elem => {
        if (isConceptualVarRef(elem)) {
            return conceptualGetElements(elem.items);
        } else if (isConceptualFunctionCall(elem)) {
            return createFunction(elem.func, elem.extraArgs)(conceptualGetElements(elem.items));
        } else if (R.is(Array, elem)) {
            return conceptualGetElements(elem);
        } else {
            return [elem];
        }
        throw 'Unknown object';
    }, conceptual);
}

export function normalizeVars(vars: VarDict): VarDict {
    return map<FlexibleItem, FlexibleItem>(v => convertConceptualSequenceToData(convertSequenceDataToConceptual(v as MultiSequenceDef, vars)))(vars);
}