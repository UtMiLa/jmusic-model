import { Time, TimeSpan } from './../rationals/time';
import R = require('ramda');
import { ProjectDef } from '../data-only/project';
import { VarDict, VariableRef } from '../data-only/variables';
import { MultiSequenceDef, SequenceDef, VoiceContentDef, VoiceDef, isSplitSequence } from '../data-only/voices';
import { FlexibleSequence, FunctionPathElement, PathElement, flexibleItemToDef, isVariablePathElement, recursivelySplitStringsIn } from '../score/flexible-sequence';
import { FlexibleItem } from '../score/types';
import { VariableRepository, createRepo, isVariableRef, valueOf } from '../score/variables';
import { MusicEvent, getDuration, isLongDecoration, isMusicEvent, isNote, isStateChange, parseLilyElement, splitByNotes } from '../score/sequence';
import { ActiveFunctionCall, ActiveProject, ActiveScore, ActiveSequence, ActiveSequenceItem, ActiveStaff, ActiveVarRef, 
    ActiveVarRepo, 
    ActiveVarsAnd, 
    ActiveVoice, 
    ElementDescriptor, 
    isActiveFunctionCall, isActiveVarRef } from './types';
import { isSeqFunction, SeqFunction } from '../data-only/functions';
import { createFunction, createInverseFunction } from '../score/functions';
import { noteAsLilypond } from '../notes/note';
import { map } from 'fp-ts/Record';
import { ClefType } from '../data-only/states';
import { ignoreIfUndefined } from '../../tools/ignore-if-undefined';
import { isSpacer, spacerAsLilypond } from '../notes/spacer';
import { ScoreDef, StaffDef } from '../data-only/score';
import { Clef } from '../states/clef';
import { Key } from '../states/key';
import { MeterFactory } from '../states/meter';
import { array } from 'fp-ts';


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
    
    const elements: ActiveSequence = R.chain(
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
                    const funcRes = createFunction(item.function, item.extraArgs)(calcElements([item.args], repo));
                    const duration = funcRes.reduce((prev, curr) => Time.addSpans(prev, getDurationForActive(curr)), Time.NoTime);
                    return [{
                        type: 'Func',
                        func: item.function,
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
                (item: string[]) => [parseLilyElement(item[0])] as ActiveSequenceItem[]
            ],
            [
                isMusicEvent, (item: MusicEvent) => [item as ActiveSequenceItem]
            ],
            [
                isOtherFlexibleItemArray, (elm) => requireElements(elm, repo) as ActiveSequenceItem[]
            ]
        ]),
        init);
    
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
            const res = { function: elem.func, args: convertActiveSequenceToData(elem.items) } as SeqFunction;
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

    return array.chainWithIndex((i, elem: ActiveSequenceItem) => {
        if (isActiveVarRef(elem)) {
            return activeGetElements(elem.items);
        } else if (isActiveFunctionCall(elem)) {
            return createFunction(elem.func, elem.extraArgs)(activeGetElements(elem.items));
        } else if (R.is(Array, elem)) {
            return activeGetElements(elem);
        } else {
            return [elem];
        }
        throw 'Unknown object';
    })(active).map( (elm, i) => ({ 
        position: {
            staffNo: -1, voiceNo: -1, elementNo: i
        }, 
        path: [],
        element: elm 
    }));
}


export function activeGetElements(active: ActiveSequence): MusicEvent[] {
    return activeGetPositionedElements(active).map(res => res.element);
}

export function normalizeVars(vars: VarDict): VarDict {
    return map<FlexibleItem, FlexibleItem>(v => convertActiveSequenceToData(convertSequenceDataToActive(v as MultiSequenceDef, vars)))(vars);
}

function indexToPath0(sequence: ActiveSequence, repo: ActiveVarRepo, index: number): PathElement<MusicEvent>[] {
    const itemsToPaths = (item: ActiveSequenceItem): PathElement<MusicEvent>[][] => {
        if (typeof item === 'string') {
            const no = splitByNotes(item).length;
            return R.range(0, no).map(n => [n]);
        } else if (isActiveFunctionCall(item)) {                
            return createFunction(item.func, item.extraArgs)(activeGetElements(item.items))
                .map((a, i) => [
                    { 
                        function: createFunction(item.func, item.extraArgs), 
                        inverse: createInverseFunction(item.func, item.extraArgs)
                    } as FunctionPathElement<MusicEvent[]>, 
                    i, 
                    0
                ]);
        } else if (isActiveVarRef(item)) {
            const varSeq = repo[item.name];
            return item.items.map((e, i) => [{ variable: item.name }, ...indexToPath0(varSeq, repo, i)]);
        } else if (isMusicEvent(item)) {
            return [[0]];
        } else if (isSplitSequence(item)) {
            throw 'Not supported b';
        } else {
            throw 'Not supported d';
        }
        throw 'Not supported c';
    };
    
    

    const allPaths = array.chainWithIndex<ActiveSequenceItem, PathElement<MusicEvent>[]>(
        (idx: number, s: ActiveSequenceItem) => itemsToPaths(s).map<PathElement<MusicEvent>[]>(
            x => x.length > 1 && typeof x[0] === 'string' ? x : [idx, ...x]
        ))(sequence);

    if (index >= allPaths.length) throw 'Illegal index';

    return allPaths[index];
}


export function indexToPath(project: ActiveProject, elmDesc: ElementDescriptor): PathElement<MusicEvent>[] {
    const path = indexToPath0(
        project.score.staves[elmDesc.position.staffNo].voices[elmDesc.position.voiceNo].content, 
        project.vars, 
        elmDesc.position.elementNo
    );

    const varPath = path.find(n => isVariablePathElement(n));

    if (varPath) return array.dropLeft(1)(path); // todo: find out why we need to drop 1

    return ['score', 'staves', elmDesc.position.staffNo, 'voices', elmDesc.position.voiceNo, 'content', 
        ...path
    ];
}
