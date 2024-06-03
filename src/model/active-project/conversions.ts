import { Time, TimeSpan } from '../rationals/time';
import R = require('ramda');
import { VarDict, VariableRef } from '../data-only/variables';
import { MultiSequenceDef, VoiceContentDef, isSplitSequence } from '../data-only/voices';
import { FunctionPathElement, PathElement, isVariablePathElement, recursivelySplitStringsIn } from '../score/flexible-sequence';
import { FlexibleItem } from '../score/types';
import { VariableRepository, createRepo, isVariableRef, valueOf } from '../score/variables';
import { MusicEvent, getDuration, isLongDecoration, isMusicEvent, isNote, isStateChange, parseLilyElement } from '../score/sequence';
import { ActiveProject, ActiveSequence, ActiveSequenceItem, 
    ActiveVarRepo, 
    ElementDescriptor, 
    isActiveFunctionCall, isActiveVarRef } from './types';
import { isSeqFunction, SeqFunction } from '../data-only/functions';
import { createFunction, createInverseFunction } from '../score/functions';
import { noteAsLilypond } from '../notes/note';
import { map } from 'fp-ts/Record';
import { isSpacer, spacerAsLilypond } from '../notes/spacer';
import { array } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';


function calcElements(items: FlexibleItem[], repo: VariableRepository): MusicEvent[] {
    return activeGetElements(requireElements(items, repo));
}
function isSingleStringArray(test: unknown): test is string[] {
    return (test as string[]).length === 1 && typeof ((test as string[])[0]) === 'string';
}

function isOtherFlexibleItemArray(test: unknown): test is FlexibleItem[] {
    return true;
}

function getDurationForActive(elem: ActiveSequenceItem): TimeSpan {
    if (isActiveVarRef(elem) || isActiveFunctionCall(elem)) return elem.duration;
    if (R.is(Array, elem)) return elem.reduce((accu, child) => getDurationForActive(child), Time.NoTime);
    return getDuration(elem);
}

function requireElements(
    init: FlexibleItem[],
    repo: VariableRepository
): ActiveSequence {
    
    const elements: ActiveSequence = array.chain(
        R.cond([
            [
                R.is(String),
                ((item: string): ActiveSequenceItem[] => item ? [parseLilyElement(item) as MusicEvent] : [])
            ],                    
            /*[
                isMultiSequence,
                (item: MultiSequence) => R.flatten(item.sequences.map(subSeq => calcElements([subSeq], this.repo)))
            ],*/
            [
                isSeqFunction,
                (item: SeqFunction) => { 
                    const elems = requireElements([item.args], repo);
                    const func = createFunction(item.function, item.extraArgs);
                    const funcRes = func(calcElements([item.args], repo));
                    const duration = funcRes.reduce((prev, curr) => Time.addSpans(prev, getDurationForActive(curr)), Time.NoTime);
                    return [{
                        type: 'Func',
                        name: item.function,
                        /*func: createFunction(item.function, item.extraArgs),
                        inverse: createInverseFunction(item.function, item.extraArgs),*/
                        items: elems,
                        extraArgs: item.extraArgs,
                        duration
                    } as ActiveSequenceItem];
                }
            ],
            [
                isVariableRef,
                (item: VariableRef) => { 
                    const varRes = requireElements(valueOf(repo, item.variable).elements, repo);
                    const duration = varRes.reduce((prev, curr) => Time.addSpans(prev, getDurationForActive(curr)), Time.NoTime);
                    return [{ 
                        type: 'VarRef',
                        name: item.variable, 
                        items: varRes, 
                        duration
                    }] as ActiveSequenceItem[];
                }
            ],
            [
                isSingleStringArray,
                (item: string[]) => { 
                    try {
                        return [parseLilyElement(item[0])] as ActiveSequenceItem[];
                    } catch (e) {
                        //console.log('How did we end up here?');
                        return [];
                    }
                }
            ],
            [
                isMusicEvent, (item: MusicEvent) => [item as ActiveSequenceItem]
            ],
            [
                isOtherFlexibleItemArray, (elm) => requireElements(elm, repo) as ActiveSequenceItem[]
            ]
        ]))(init);
    
    return elements;
}




//export function convertDataToActive(data: ProjectDef): Conce {}

export function convertSequenceItemToActive(data: MusicEvent, vars: VarDict): ActiveSequenceItem {
    return requireElements(recursivelySplitStringsIn(data, createRepo(vars)), createRepo(vars))[0]; // todo: this should be possible to do nicer
}


export function convertSequenceDataToActive(data: VoiceContentDef, vars: VarDict): ActiveSequence {
    return requireElements(recursivelySplitStringsIn(data, createRepo(vars)), createRepo(vars));
}


export function convertActiveSequenceToData(active: ActiveSequence): VoiceContentDef {
    return active.map(elem => {
        if (isActiveVarRef(elem)) {
            return { variable: elem.name };
        } else if (isActiveFunctionCall(elem)) {
            const res = { function: elem.name, args: convertActiveSequenceToData(elem.items) } as SeqFunction;
            if (elem.extraArgs) res.extraArgs = elem.extraArgs;
            return res;
        } else if (R.is(Array, elem)) {
            return convertActiveSequenceToData(elem);
        } else {
            if (isNote(elem)) {
                return noteAsLilypond(elem);
            }
            if (isStateChange(elem)) {
                return elem;
            }
            if (isSpacer(elem)) {
                return spacerAsLilypond(elem);
            }
            if (isLongDecoration(elem)) {
                return elem;
            }
        }
        throw 'Unknown object' + JSON.stringify(elem);
    });
}

export function activeGetPositionedElements(active: ActiveSequence): ElementDescriptor[] {

    return pipe(
        active,
        array.chainWithIndex((i, elem: ActiveSequenceItem) => {
            if (isActiveVarRef(elem)) {
                return activeGetPositionedElements(elem.items);  // todo: let position pass through 
            } else if (isActiveFunctionCall(elem)) {
                return array.mapWithIndex( (i: number, elm: MusicEvent) => ({ 
                    position: {
                        staffNo: -1, voiceNo: -1, elementNo: i
                    }, 
                    path: [],
                    element: elm 
                }))(createFunction(elem.name, elem.extraArgs)(activeGetPositionedElements(elem.items).map(res => res.element)));
            } else if (R.is(Array, elem)) {
                return activeGetPositionedElements(elem);
            } else {
                return [{ 
                    position: {
                        staffNo: -1, voiceNo: -1, elementNo: i
                    }, 
                    path: [],
                    element: elem 
                }];
            }
            throw 'Unknown object';
        }),
        array.mapWithIndex( (i: number, elm: ElementDescriptor) => ({ 
            position: {
                staffNo: -1, voiceNo: -1, elementNo: i
            }, 
            path: elm.path,
            element: elm.element 
        }))
    );     
}


export function activeGetElements(active: ActiveSequence): MusicEvent[] {
    return activeGetPositionedElements(active).map(res => res.element);
}

export function normalizeVars(vars: VarDict): VarDict {
    return map<FlexibleItem, FlexibleItem>(v => convertActiveSequenceToData(convertSequenceDataToActive(v as MultiSequenceDef, vars)))(vars);
}

function indexToPath0(sequence: ActiveSequence, repo: ActiveVarRepo, index: number): PathElement<MusicEvent>[] {
    const itemsToPaths = (item: ActiveSequenceItem): PathElement<MusicEvent>[][] => {
        if (isActiveFunctionCall(item)) {
            const itemPaths = activeGetElements(item.items).map((elm, j) => ['args', ...indexToPath0(item.items, repo, j)]);
            return itemPaths;
        } else if (isActiveVarRef(item)) {
            const varSeq = repo[item.name];
            return item.items.map((e, i) => [{ variable: item.name }, ...indexToPath0(varSeq, repo, i)]);
        } else if (isMusicEvent(item)) {
            return [[]];
        } else if (isSplitSequence(item)) {
            throw 'Not supported b';
        } else {
            throw 'Not supported d';
        }
        throw 'Not supported c';
    };
    
    

    const allPaths = array.chainWithIndex<ActiveSequenceItem, PathElement<MusicEvent>[]>(
        (idx: number, s: ActiveSequenceItem) => itemsToPaths(s).map<PathElement<MusicEvent>[]>(
            x => x.length > 1 && (isVariableRef(x[0] as any)) ? [idx, ...x] : [idx, ...x]
        ))(sequence);

    if (index >= allPaths.length) {
        console.log(index, allPaths);
        throw 'Illegal index';
    }

    return allPaths[index];
}


export function indexToPath(project: ActiveProject, elmDesc: ElementDescriptor): PathElement<MusicEvent>[] {
    const path = indexToPath0(
        project.score.staves[elmDesc.position.staffNo].voices[elmDesc.position.voiceNo].content, 
        project.vars, 
        elmDesc.position.elementNo
    );

    const varPath = path.find(n => isVariablePathElement(n));

    if (varPath) return path;

    return ['score', 'staves', elmDesc.position.staffNo, 'voices', elmDesc.position.voiceNo, 'content', 
        ...path
    ];
}
