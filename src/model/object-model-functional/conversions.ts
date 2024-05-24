import { Time, TimeSpan } from './../rationals/time';
import R = require('ramda');
import { ProjectDef } from '../data-only/project';
import { VarDict, VariableRef } from '../data-only/variables';
import { MultiSequenceDef, SequenceDef, VoiceContentDef, VoiceDef } from '../data-only/voices';
import { flexibleItemToDef, recursivelySplitStringsIn } from '../score/flexible-sequence';
import { FlexibleItem } from '../score/types';
import { VariableRepository, createRepo, isVariableRef, valueOf } from '../score/variables';
import { ActiveFunctionCall, ActiveProject, ActiveScore, ActiveSequence, ActiveSequenceItem, ActiveStaff, ActiveVarRef, 
    ActiveVarRepo, 
    ActiveVarsAnd, 
    ActiveVoice, 
    isActiveFunctionCall, isActiveVarRef } from './types';
import { MusicEvent, getDuration, isMusicEvent, isNote, isStateChange, parseLilyElement } from '../score/sequence';
import { isSeqFunction, SeqFunction } from '../data-only/functions';
import { createFunction } from '../score/functions';
import { noteAsLilypond } from '../notes/note';
import { map } from 'fp-ts/Record';
import { ClefType } from '../data-only/states';
import { Clef } from '../states/clef';
import { ScoreDef, StaffDef } from '../data-only/score';


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
        }
        throw 'Unknown object';
    });
}

export function activeGetElements(active: ActiveSequence): MusicEvent[] {
    return R.chain(elem => {
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
    }, active);
}

export function normalizeVars(vars: VarDict): VarDict {
    return map<FlexibleItem, FlexibleItem>(v => convertActiveSequenceToData(convertSequenceDataToActive(v as MultiSequenceDef, vars)))(vars);
}

export function convertVarDataToActive(vars: VarDict): ActiveVarRepo {
    return R.map((value: FlexibleItem) => convertSequenceDataToActive(flexibleItemToDef(value), vars), vars);
}

export function convertVoiceDataToActive(voiceDef: VoiceDef, vars: VarDict): ActiveVarsAnd<ActiveVoice> {
    return {
        item: { 
            content: convertSequenceDataToActive(voiceDef.contentDef, vars) 
        },
        vars: convertVarDataToActive(vars)
    };
}

export function convertStaffDataToActive(staffDef: StaffDef, vars: VarDict): ActiveVarsAnd<ActiveStaff> {
    return {
        item: {
            voices: staffDef.voices.map(voice => convertVoiceDataToActive(voice, vars).item)
        },
        vars: convertVarDataToActive(vars)
    };
}


export function convertScoreDataToActive(scoreDef: ScoreDef, vars: VarDict): ActiveVarsAnd<ActiveScore> {
    return {
        item: {
            staves: scoreDef.staves.map(staff => convertStaffDataToActive(staff, vars).item)
        },
        vars: convertVarDataToActive(vars)
    };
}

export function convertProjectDataToActive(projectDef: ProjectDef): ActiveProject {
    return {
        score: convertScoreDataToActive(projectDef.score, projectDef.vars).item,
        vars: convertVarDataToActive(projectDef.vars)
    };
}