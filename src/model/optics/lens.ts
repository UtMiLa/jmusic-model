import { VariableRepository, createRepo, varDefArrayToVarDict, varDictToVarDefArray } from './../score/variables';
import { ISequence, MusicEvent, isNote } from '../score/sequence';
import R = require('ramda');
import { FlexibleItem, ProjectDef, VarDict, VariableDef } from '../score/types';
import { voiceSequenceToDef } from '../score/voice';
import { FlexibleSequence, FunctionPathElement, PathElement, VarablePathElement, isFunctionPathElement, isVarablePathElement, simplifyDef } from '../score/flexible-sequence';
import { AbsoluteTime, Time } from '../rationals/time';
import { lookupVariable } from '../score/variables';
import { ScoreDef } from '../score/score';

export type ProjectLens = R.Lens<ProjectDef, MusicEvent | undefined>;

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

function pathElementToLens<T>(pathElm: PathElement<T>) {
    return R.cond<PathElement<T>, string, number, FunctionPathElement<T>, VarablePathElement, R.Lens<Record<string, any>, any>>([
        [R.is(String), R.lensProp],
        [R.is(Number), R.lensIndex],
        [isFunctionPathElement<T>, functionLens],
        [isVarablePathElement<T>, (v) => R.lensPath(['vars', v.variable])]
    ])(pathElm);
}

export function lensFromLensDef<T, X, Y>(lensDef: PathElement<T>[]): R.Lens<Record<string, X>, Y> {
    return R.reduce<PathElement<T>, R.Lens<Record<string, any>, any>>(
        (lens1: R.Lens<Record<string, any>, any>, pathElm: PathElement<T>) => R.ifElse(
            isVarablePathElement,
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
            new FlexibleSequence(pd.score.staves[timed.staff].voices[timed.voice].content, createRepo(varDictToVarDefArray(pd.vars))), 
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
    return path.some(isVarablePathElement);
}

function sequenceElementSetter(index: NaturalLensIndexScore): (a: MusicEvent | undefined, s: ProjectDef) => ProjectDef {
    return (a: MusicEvent | undefined, pd: ProjectDef) => {
        const seq = new FlexibleSequence(pd.score.staves[index.staff].voices[index.voice].content, createRepo(varDictToVarDefArray(pd.vars)));
        const path = seq.indexToPath(index.element);
        //console.log(path);
        path.pop(); // todo: remove annoying last 0 from path

        if (isVarPath(path)) { // todo: should be handled by lensFromLensDef
            // var reference
            const lastVarIndex = path.findIndex(isVarablePathElement);
            const restPath = path.slice(lastVarIndex);
            const varName = (restPath[0] as VarablePathElement).variable;
            const val = varDictToVarDefArray(pd.vars).map(item => item.id === varName
                ? { id: item.id, value: R.assocPath((restPath as (string | number)[]).slice(1), a ? simplifyDef(a) : [], new FlexibleSequence(item.value).asObject) }
                : item);
            return R.assoc('vars', varDefArrayToVarDict(val), pd);
        }

        const value: FlexibleItem = a ? simplifyDef(a) : [];

        return R.set(lensFromLensDef(['score', 'staves', index.staff, 'voices', index.voice, 'content', ...path]) as unknown as R.Lens<ProjectDef, FlexibleItem>, value, pd);


        /*const path1 = ((path.length) ? path.map(item => item === '@args' ? 'args' : item) : path) as (string | number)[];


        return R.assocPath(['score', 'staves', index.staff, 'voices', index.voice, 'content', ...path1], value, pd);*/


    };
}

function sequenceElementGetter(index: NaturalLensIndexScore): (s: ProjectDef) => MusicEvent | undefined {
    return (pd: ProjectDef) => new FlexibleSequence(pd.score.staves[index.staff].voices[index.voice].content, createRepo(varDictToVarDefArray(pd.vars))).elements[index.element];
}

function varLensByIndex(index: NaturalLensIndexVariable): ProjectLens {
    return R.lens(
        varGetter(index),
        varSetter(index)
    );
}

function changeVarInRepo(varName: string, valueChanger: (f: FlexibleItem) => FlexibleItem, repo: VariableDef[]): VariableDef[] {
    return repo.map(v => {
        if (v.id === varName) {
            return { id: varName, value: valueChanger(v.value)  };
        } else {
            return v;
        }
    });
}

function varSetter(index: NaturalLensIndexVariable): (a: MusicEvent | undefined, s: { vars: VarDict; score: ScoreDef; }) => { vars: VarDict; score: ScoreDef; } {
    return (a: MusicEvent | undefined, pd: ProjectDef) => (
        {
            ...pd,
            vars: varDefArrayToVarDict(changeVarInRepo(index.variable, v => setModifiedVar(index, v, pd, a), varDictToVarDefArray(pd.vars)))
        }
    );
}

function elementsToDef(elements: MusicEvent[]): FlexibleItem {
    return voiceSequenceToDef(new FlexibleSequence(elements));
}

function setModifiedVar(index: NaturalLensIndexVariable, value: FlexibleItem, pd: ProjectDef, a: MusicEvent | undefined): FlexibleItem {
    const seq = new FlexibleSequence(value, createRepo(varDictToVarDefArray(pd.vars)));
    return elementsToDef(
        a ? 
            seq.elements.map(
                (value, i) => i === index.element ? a : value
            )
            : 
            seq.elements.filter(
                (value, i) => i !== index.element
            )
    );    
}

function varGetter(index: NaturalLensIndexVariable): (s: { vars: VarDict; score: ScoreDef; }) => MusicEvent | undefined {
    return (pd: ProjectDef) => new FlexibleSequence(new FlexibleSequence(lookupVariable(varDictToVarDefArray(pd.vars), index.variable)).asObject, createRepo(varDictToVarDefArray(pd.vars))).elements[index.element];
}

export function projectLensByTime(index: TimeLensIndex): ProjectLens {
    // get seq
    // find index from time
    // call projectLensByIndex
    return R.lens(
        (pd: ProjectDef) => R.view(projectLensByIndex(timedToIndex(pd, index)), pd),
        (a: MusicEvent | undefined, pd: ProjectDef) => R.set(projectLensByIndex(timedToIndex(pd, index)), a, pd)
    ) ;
}
