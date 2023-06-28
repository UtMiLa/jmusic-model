import { createRepo } from './../score/variables';
import { ISequence, MusicEvent, isNote } from '../score/sequence';
import R = require('ramda');
import { FlexibleItem, ProjectDef, VarDict, VariableDef } from '../score/types';
import { voiceSequenceToDef } from '../score/voice';
import { FlexibleSequence, FunctionPathElement, PathElement, VarablePathElement, isFunctionPathElement, isVarablePathElement as isVariablePathElement, simplifyDef } from '../score/flexible-sequence';
import { AbsoluteTime, Time } from '../rationals/time';
import { lookupVariable } from '../score/variables';
import { ScoreDef } from '../score/score';
import { Note } from '../notes/note';

/*
export type LensItem = MusicEvent | undefined;

export const lensItemOf = (event: MusicEvent): LensItem => event;//R.of(Array);
export const lensItemNone: LensItem = undefined;

export const lensItemValue = (item: LensItem): MusicEvent => { 
    if (item) return item; 
    throw 'Undefined lens item'; 
};

export const lensItemHasValue = (item: LensItem): item is MusicEvent => !!item;
export function doWithNote(lensItem: LensItem, transform: (note: Note) => LensItem): LensItem {
    if (!lensItem || !isNote(lensItem)) return lensItem;
    return transform(lensItem);
}

*/

export type LensItem = MusicEvent[];

export const lensItemOf: (event: MusicEvent) => LensItem = R.of;
export const lensItemNone: LensItem = [];

export const lensItemValue = (item: LensItem): MusicEvent => { 
    if (item.length === 1) return item[0]; 
    throw 'Undefined lens item'; 
};

export const lensItemHasValue = (item: LensItem): boolean => !!item.length;


export function doWithNote(lensItem: LensItem, transform: (note: Note) => LensItem): LensItem {
    if (!lensItem.length) return lensItem;
    if (lensItem.length !== 1) return lensItem;
    if (!isNote(lensItem[0])) return lensItem;
    return transform(lensItem[0]);
}



export type ProjectLens = R.Lens<ProjectDef, LensItem>;

export interface NaturalLensIndexScore {
    staff: number;
    voice: number;
    element: number;
}

export interface NaturalLensIndexVariable {
    variable: string;
    element: number;
}

export type NaturalLensIndex = NaturalLensIndexScore | NaturalLensIndexVariable

export interface TimeLensIndex {
    staff: number;
    voice: number;
    time: AbsoluteTime;
    eventFilter: (event: MusicEvent) => boolean;
}

function isVarIndex(idx: NaturalLensIndex): idx is NaturalLensIndexVariable {
    return !!(idx as NaturalLensIndexVariable).variable;
}

function isScoreIndex(idx: NaturalLensIndex): idx is NaturalLensIndexScore {
    return !!(idx as NaturalLensIndexScore).staff;
}

const modifySequenceByTime = (seq: FlexibleSequence, atTime: AbsoluteTime, item: MusicEvent) => seq.chainElements(
    (ct, time) => {
        return [Time.equals(time, atTime) && isNote(ct) ? item : ct];
    }
);

function composeLenses<T1, T2, T3>(lens1: R.Lens<T1, T2>, lens2: R.Lens<T2, T3>): R.Lens<T1, T3> {
    return R.compose(lens1, lens2);
    /*return R.lens(
        R.view(lens1, R.view(lens2)),
        R.set(lens1)
    )/*/
}

function functionLens<T>(fp: FunctionPathElement<T>): R.Lens<Record<string, any>, any> {
    /*return R.lens(
        obj => obj, //.args.map(fp.function),
        (value, obj) => R.assoc('args', value, obj)
    );*/
    return R.lens(
        obj => R.prop('args', obj), //.args.map(fp.function),
        (value, obj) => R.assoc('args', value, obj)
    );
    //return R.lensProp('args');
}

function variableLens<T>(vp: VarablePathElement): R.Lens<Record<string, any>, any> {
    return R.lensPath(['vars', vp.variable]);
}

function pathElementToLens<T>(pathElm: PathElement<T>) {
    return R.cond<PathElement<T>, string, number, FunctionPathElement<T>, VarablePathElement, R.Lens<Record<string, any>, any>>([
        [R.is(String), R.lensProp],
        [R.is(Number), R.lensIndex],
        [isFunctionPathElement<T>, functionLens],
        [isVariablePathElement<T>, variableLens]//R.lensPath(['vars', v.variable])]
    ])(pathElm);
}

export function lensFromLensDef<T, X, Y>(lensDef: PathElement<T>[]): R.Lens<Record<string, X>, Y> {
    return R.reduce<PathElement<T>, R.Lens<Record<string, any>, any>>(
        (lens1: R.Lens<Record<string, any>, any>, pathElm: PathElement<T>) => R.ifElse(
            isVariablePathElement,
            pathElementToLens,
            (pathElm) => composeLenses(lens1, pathElementToLens(pathElm))
        )(pathElm), 

        R.lens(R.identity, R.identity), 

        lensDef
    );
}

function getElementIndex(seq: ISequence, time: AbsoluteTime, eventFilter: (event: MusicEvent) => boolean): number {
    return seq.indexOfTime(time);
}

function timedToIndex(pd: ProjectDef, timed: TimeLensIndex): NaturalLensIndex {
    return {
        staff: timed.staff,
        voice: timed.voice,
        element: getElementIndex(
            new FlexibleSequence(pd.score.staves[timed.staff].voices[timed.voice].contentDef, createRepo(pd.vars)), 
            timed.time, 
            timed.eventFilter
        )
    };
}


export function projectLensByIndex(index: NaturalLensIndex): ProjectLens {

    if (isVarIndex(index)) {
        return varLensByIndex(index);
    } else {
        return voiceLensByIndex(index);
    }

}


function voiceLensByIndex(index: NaturalLensIndexScore): ProjectLens {
    return R.lens(
        sequenceElementGetter(index),
        sequenceElementSetter(index)
    );
}

function isVarPath<T>(path: PathElement<T>[]): boolean
{
    return path.some(isVariablePathElement);
}





function sequenceElementSetter(index: NaturalLensIndexScore): (a: LensItem, s: ProjectDef) => ProjectDef {
    return (a: LensItem, pd: ProjectDef) => {
        const seq = new FlexibleSequence(pd.score.staves[index.staff].voices[index.voice].contentDef, createRepo(pd.vars));
        const path = seq.indexToPath(index.element);
        //console.log(path);
        path.pop(); // todo: remove annoying last 0 from path

        const value: FlexibleItem = a ? simplifyDef(a) : [];

        return R.set(lensFromLensDef(['score', 'staves', index.staff, 'voices', index.voice, 'contentDef', ...path]) as unknown as R.Lens<ProjectDef, FlexibleItem>, value, pd);

    };
}

function sequenceElementGetter(index: NaturalLensIndexScore): (s: ProjectDef) => LensItem {
    return (pd: ProjectDef) => lensItemOf(new FlexibleSequence(pd.score.staves[index.staff].voices[index.voice].contentDef, createRepo(pd.vars)).elements[index.element]);
}

function varLensByIndex(index: NaturalLensIndexVariable): ProjectLens {
    return R.lens(
        varGetter(index),
        varSetter(index)
    );
}

function changeVarInRepo(varName: string, valueChanger: (f: FlexibleItem) => FlexibleItem, repo: VarDict): VarDict {
    return R.assoc(varName, valueChanger(repo[varName]), repo);
}

function varSetter(index: NaturalLensIndexVariable): (a: LensItem, s: { vars: VarDict; score: ScoreDef; }) => { vars: VarDict; score: ScoreDef; } {
    return (a: LensItem, pd: ProjectDef) => (
        {
            ...pd,
            vars: changeVarInRepo(index.variable, v => setModifiedVar(index, v, pd, a), pd.vars)
        }
    );
}

function elementsToDef(elements: MusicEvent[]): FlexibleItem {
    return voiceSequenceToDef(new FlexibleSequence(elements));
}

const musicEventChain = R.addIndex<MusicEvent, LensItem>(R.chain);

function setModifiedVar(index: NaturalLensIndexVariable, value: FlexibleItem, pd: ProjectDef, a: LensItem): FlexibleItem {
    const seq = new FlexibleSequence(value, createRepo(pd.vars));
    return elementsToDef(
        lensItemHasValue(a) ? 
            musicEventChain(
                (value, i) => i === index.element ? a : lensItemOf(value),
                seq.elements
            )
            
            /*seq.elements.map(
                (value, i) => i === index.element ? lensItemValue(a) : value
            )*/
            : 
            seq.elements.filter(
                (value, i) => i !== index.element
            )
    );    
}

function varGetter(index: NaturalLensIndexVariable): (s: ProjectDef) => LensItem {
    return (pd: ProjectDef) => lensItemOf(new FlexibleSequence(new FlexibleSequence(lookupVariable(pd.vars, index.variable)).asObject, createRepo(pd.vars)).elements[index.element]);
}

export function projectLensByTime(index: TimeLensIndex): ProjectLens {
    // get seq
    // find index from time
    // call projectLensByIndex
    return R.lens(
        (pd: ProjectDef) => R.view(projectLensByIndex(timedToIndex(pd, index)), pd),
        (a: LensItem, pd: ProjectDef) => R.set(projectLensByIndex(timedToIndex(pd, index)), a, pd)
    ) ;
}
