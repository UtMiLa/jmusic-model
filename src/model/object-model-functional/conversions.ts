import { Time } from './../rationals/time';
import R = require('ramda');
import { ProjectDef } from '../data-only/project';
import { VarDict, VariableRef } from '../data-only/variables';
import { VoiceContentDef } from '../data-only/voices';
import { FlexibleSequence, recursivelySplitStringsIn } from '../score/flexible-sequence';
import { FlexibleItem } from '../score/types';
import { VariableRepository, createRepo, isVariableRef, valueOf } from '../score/variables';
import { ConceptualFunctionCall, ConceptualSequence, ConceptualSequenceItem, ConceptualVarRef } from './types';
import { MusicEvent, getDuration, isMusicEvent, parseLilyElement } from '../score/sequence';
import { isSeqFunction, SeqFunction } from '../data-only/functions';
import { createFunction } from '../score/functions';


function calcElements(items: FlexibleItem[], repo: VariableRepository): MusicEvent[] {
    return new FlexibleSequence(items, repo, true).elements; // todo: refactor FlexibleSequence out of this module
}
function isSingleStringArray(test: unknown): test is string[] {
    return (test as string[]).length === 1 && typeof ((test as string[])[0]) === 'string';
}

function isOtherFlexibleItemArray(test: unknown): test is FlexibleItem[] {
    return true;
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
                    const duration = funcRes.reduce((prev, curr) => Time.addSpans(prev, getDuration(curr)), Time.NoTime);
                    return [{
                        func: 'Reverse',
                        items: elems,
                        duration
                    } as ConceptualFunctionCall as ConceptualSequenceItem];
                }
            ],
            [
                isVariableRef,
                (item: VariableRef) => { 
                    const varRes = valueOf(repo, item.variable).elements;
                    const duration = varRes.reduce((prev, curr) => Time.addSpans(prev, getDuration(curr)), Time.NoTime);
                    return [{ 
                        name: item.variable, 
                        items: varRes, 
                        duration
                    } as ConceptualVarRef] as ConceptualSequenceItem[];
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


export function convertSequenceDataToConceptual(data: VoiceContentDef, vars: VarDict): ConceptualSequence {
    return requireElements(recursivelySplitStringsIn(data, createRepo(vars)), createRepo(vars));
}