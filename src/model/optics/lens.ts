import { createRepo } from './../score/variables';
import { ISequence, MusicEvent, isNote } from '../score/sequence';
import R = require('ramda');
import { FlexibleItem, FuncDef, MultiFlexibleItem, ProjectDef, SeqFunction, VarDict, VariableDef } from '../score/types';
import { voiceDefToVoice, voiceSequenceToDef } from '../score/voice';
import { FlexibleSequence, FunctionPathElement, PathElement, VarablePathElement, isFunctionPathElement, isVariablePathElement as isVariablePathElement, simplifyDef } from '../score/flexible-sequence';
import { AbsoluteTime, Time } from '../rationals/time';
import { lookupVariable } from '../score/variables';
import { ScoreDef } from '../score/score';
import { Note } from '../notes/note';
import { Func } from 'mocha';
import { MultiFlexibleSequence } from '../score/multi-flexible-sequence';

/*
Different takes on the monad LensItem. First is MusicEvent | undefined and could be better implemented with the functional Maybe class.
This can be used to replace one MusicEvent with one or zero MusicEvents.

The other is MusicEvent[] which has the potential benefit of allowing to replace one MusicEvent with one or zero or several MusicEvents.

It could be nice if the LensItem type and accompanying functions were encapsulated, so other code was not able to access it internal workings.
*/


export function transformNote(transform: (note: Note) => LensItem): (note: MusicEvent) => LensItem {
    return item => isNote(item) ? transform(item) : lensItemOf(item);
}

/*
export type LensItem = MusicEvent | undefined;

export const lensItemOf = (event: MusicEvent): LensItem => event;
export const lensItemNone: LensItem = undefined;

export const lensItemHasValue = (item: LensItem): item is MusicEvent => !!item;

export function doWithNote(transform: (note: Note) => LensItem): (lensItem: LensItem) => LensItem {
    return lensItem => {
        if (!lensItem) return lensItem;
        return transformNote(transform)(lensItem);
    };
}
*/


export type LensItem = MusicEvent[];

export const lensItemOf: (event: MusicEvent) => LensItem = R.of;
export const lensItemNone: LensItem = [];

export const lensItemHasValue = (item: LensItem): boolean => !!item.length;

export const doWithNote = (transform: (note: Note) => LensItem): ((x: LensItem) => LensItem) => (lensItem: LensItem) => lensItemBind(transformNote(transform))(lensItem);

export const lensItemBind = R.chain;

// LensItem special functions ends here

export interface DomainConverter<Def, Model> {
    fromDef(def: Def): Model;
    toDef(model: Model): Def;
}

export type ProjectLens = R.Lens<ProjectDef, LensItem>;

export interface NaturalLensIndexScore {
    staff: number;
    voice: number;
    element: number;
    subVoice?: number;
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



/*

When lensing functions, it should do like this:

    Simple case: function is an isomorphism like chromatic transposing and augmenting.
        Each note is transformed into one note using a note transformation, and the inverse transformation
        exists which can transform it back to the original.
        
    Permutations: function is still an isomorphism, but note indexes change, like in revert.
        The lens must modify the index in the remaining path according to index transformation.

    Context-dependent transformations: The resulting note depends on more than one original notes, like in the
        'relative' transformation. Changing one note might affect other notes.
        If there exists an inverse transformation, this can be used to change the whole original sequence:
        Transform seq => change note in transformed seq => Inverse transform => Set original.
        This pattern is simple enough to also work for the previous cases, although not performant.
    
    Lossy transformation: No inverse transformation exists.
        Removing notes will still allow for determining the original note, but modyfying
        this might alter the result of other notes (e.g. transformation is "leave only notes on strong beats";
        when changing the value of a note, the rest of the sequence can be on totally different beats).
        Other information losses can give similar problems. In some cases a qualified guess can be made 
        (e.g. diatonic transpose - where only a few accidentals might be wrong). In most cases modifications should fail.

    Merging: Merging two sequences to one can in some cases be resolved (e.g. pitches from first seq, values from 
        second - change pitch or value can be applied to the correct sequence), but in most cases they should fail.

*/



function functionLens<T>(domainConverter: DomainConverter<any, any>): (fp: FunctionPathElement<T>) => R.Lens<Record<string, any>, any> {
    /*return R.lens(
        obj => obj, //.args.map(fp.function),
        (value, obj) => R.assoc('args', value, obj)
    );*/
    return (fp: FunctionPathElement<T>) => R.lens(
        //obj => domainConverter.toDef(fp.function(domainConverter.fromDef(R.prop('args', obj)))),
        obj => { 
            const a = R.prop('args', obj);
            const b = domainConverter.fromDef(a);
            const c = fp.function(b);
            const d = domainConverter.toDef(c);
            return d;
        },
        (value, obj) => R.assoc('args', domainConverter.toDef(fp.inverse(domainConverter.fromDef(value))), obj)
    );
    //return R.lensProp('args');
}

function variableLens<T>(vp: VarablePathElement): R.Lens<Record<string, any>, any> {
    return R.lensPath(['vars', vp.variable]);
}

function pathElementToLens<T>(domainConverter: DomainConverter<any, any>, pathElm: PathElement<T>) {
    return R.cond<PathElement<T>, string, number, FunctionPathElement<T[]>, VarablePathElement, R.Lens<Record<string, any>, any>>([
        [R.is(String), R.lensProp],
        [R.is(Number), R.lensIndex],
        [isFunctionPathElement<T>, functionLens(domainConverter)],
        [isVariablePathElement<T>, variableLens]//R.lensPath(['vars', v.variable])]
    ])(pathElm);
}

export function lensFromLensDef<T, X, Y>(domainConverter: DomainConverter<any, any>, lensDef: PathElement<T>[]): R.Lens<Record<string, X>, Y> {
    return R.reduce<PathElement<T>, R.Lens<Record<string, any>, any>>(
        (lens1: R.Lens<Record<string, any>, any>, pathElm: PathElement<T>) => R.ifElse(
            isVariablePathElement,
            pathElm => pathElementToLens(domainConverter, pathElm),
            (pathElm) => composeLenses(lens1, pathElementToLens(domainConverter, pathElm))
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
            new MultiFlexibleSequence(pd.score.staves[timed.staff].voices[timed.voice].contentDef, createRepo(pd.vars)).seqs[0],  // todo: get rid of seqs[0]
            timed.time, 
            timed.eventFilter
        )
    };
}


export function projectLensByIndex(domainConverter: DomainConverter<any, any>, index: NaturalLensIndex): ProjectLens {

    if (isVarIndex(index)) {
        return varLensByIndex(index);
    } else {
        return voiceLensByIndex(domainConverter, index);
    }

}


function voiceLensByIndex(domainConverter: DomainConverter<any, any>, index: NaturalLensIndexScore): ProjectLens {
    return R.lens(
        sequenceElementGetter(index),
        sequenceElementSetter(domainConverter, index)
    );
}

function isVarPath<T>(path: PathElement<T>[]): boolean
{
    return path.some(isVariablePathElement);
}





function sequenceElementSetter(domainConverter: DomainConverter<any, any>, index: NaturalLensIndexScore): (a: LensItem, s: ProjectDef) => ProjectDef {
    return (a: LensItem, pd: ProjectDef) => {
        const seq = new MultiFlexibleSequence(pd.score.staves[index.staff].voices[index.voice].contentDef, createRepo(pd.vars));
        const path = seq.indexToPath(index.element);
        //console.log(path);
        path.pop(); // todo: remove annoying last 0 from path

        const value: FlexibleItem = a ? simplifyDef(a) : [];

        return R.set(lensFromLensDef(domainConverter, ['score', 'staves', index.staff, 'voices', index.voice, 'contentDef', ...path]) as unknown as R.Lens<ProjectDef, FlexibleItem>, value, pd);

    };
}

function sequenceElementGetter(index: NaturalLensIndexScore): (s: ProjectDef) => LensItem {
    return (pd: ProjectDef) => lensItemOf(new MultiFlexibleSequence(pd.score.staves[index.staff].voices[index.voice].contentDef, createRepo(pd.vars)).seqs[0].elements[index.element]); // todo: get rid of seqs[0]
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

function elementsToDef(elements: MusicEvent[]): MultiFlexibleItem {
    return voiceSequenceToDef(new MultiFlexibleSequence(elements).seqs[0]); // todo: get rid of seqs[0]
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
    ) as FlexibleItem;    // todo: support multi!
}

function varGetter(index: NaturalLensIndexVariable): (s: ProjectDef) => LensItem {
    return (pd: ProjectDef) => lensItemOf(new FlexibleSequence(new FlexibleSequence(lookupVariable(pd.vars, index.variable)).asObject, createRepo(pd.vars)).elements[index.element]);
}

export function projectLensByTime(domainConverter: DomainConverter<any, any>, index: TimeLensIndex): ProjectLens {
    // get seq
    // find index from time
    // call projectLensByIndex
    return R.lens(
        (pd: ProjectDef) => R.view(projectLensByIndex(domainConverter, timedToIndex(pd, index)), pd),
        (a: LensItem, pd: ProjectDef) => R.set(projectLensByIndex(domainConverter, timedToIndex(pd, index)), a, pd)
    ) ;
}
