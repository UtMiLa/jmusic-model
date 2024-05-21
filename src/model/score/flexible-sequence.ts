import { SequenceDef, FlexibleItem, SplitSequenceDef, MultiSequenceItem, clefToLilypond, meterToLilypond, keyToLilypond } from './..';
import { createRepo, isVariableRef, valueOf, VariableRepository } from './variables';
import R = require('ramda');
import { TimeSpan, AbsoluteTime, Time } from '../rationals/time';
import { createFunction, createInverseFunction } from './functions';
import { BaseSequence, getDuration, isLongDecoration, isMusicEvent, isNote, isStateChange, MusicEvent, splitByNotes } from './sequence';

import * as _ from 'ts-toolbelt';
import { isSplitSequence } from '..';
import { Note, noteAsLilypond } from '../notes/note';
import { isSeqFunction } from '../data-only/functions';
import { ConceptualSequence, ConceptualSequenceItem, isConceptualFunctionCall, isConceptualVarRef } from '../object-model-functional/types';
import { conceptualGetElements, convertConceptualSequenceToData, convertSequenceDataToConceptual } from '../object-model-functional/conversions';
import { isString } from 'fp-ts/lib/string';
import { isSpacer, spacerAsLilypond } from '../notes/spacer';

// Fix for types for R.chain
type addIndexFix<T, U> = (
    fn: (f: (item: T) => U, list: readonly T[]) => U,
) => _.F.Curry<(a: (item: T, idx: number, list: T[]) => U, b: readonly T[]) => U>;

export interface FunctionPathElement<T> { 
    function: (item: T) => T;
    inverse: (item: T) => T;
}
export interface VarablePathElement { variable: string }

export type PathElement<T> = string | number | FunctionPathElement<T[]> | VarablePathElement;

export function isFunctionPathElement<T>(test: PathElement<T>): test is FunctionPathElement<T[]> {
    return !!test && (typeof (test as FunctionPathElement<T[]>).function) === 'function';
}

export function isVariablePathElement<T>(test: PathElement<T>): test is VarablePathElement {
    return !!test && (typeof (test as VarablePathElement).variable) === 'string';
}

export function recursivelySplitStringsIn(item: FlexibleItem, repo: VariableRepository): FlexibleItem[] {
    if (typeof item === 'string') {
        return splitByNotes(item);
    } else if (isSeqFunction(item)) {
        const x = R.modify('args', args => recursivelySplitStringsIn(args, repo), item) as unknown as FlexibleItem[];
        return x;
    } else if (isVariableRef(item)) {
        return [item];//repo.valueOf(item.variable).elements;
    } else if (isMusicEvent(item)) {
        return [item];
    } else if (isSplitSequence(item)) {
        //throw 'Not supported a';
        return [{ type: 'multi', sequences: item.sequences.map(seq => recursivelySplitStringsIn(seq, repo)) } as SplitSequenceDef];
    } else {
        return item.map(i => recursivelySplitStringsIn(i, repo));
        // why not: R.chain(i => recursivelySplitStringsIn(i, repo), item);
        // because this flattens all arrays - we should be able to group notes in locked chunks
    }
}

export function simplifyDef(item: FlexibleItem): FlexibleItem {
    
    if (R.is(Array, item)) {
        if (item.length === 1)
            return simplifyDef(item[0]);
        return item.map(simplifyDef);
    } else if (isSeqFunction(item)) {
        const x = R.modify('args', args => simplifyDef(args), item) as unknown as FlexibleItem[];
        return x;
    } else if (isVariableRef(item)) {
        return item;
    } else if (isNote(item as MusicEvent)) {
        return noteAsLilypond(item as Note);
    }
    return item;
    
}

export function flexibleItemToDef(flex: FlexibleItem): MultiSequenceItem[] {
    
    if (isMusicEvent(flex)) {
        if (isNote(flex)) return [noteAsLilypond(flex)];
        if (isSpacer(flex)) return [spacerAsLilypond(flex)];
        
        if (isStateChange(flex)) {
            if (flex.clef) return [clefToLilypond(flex.clef)];
            if (flex.meter) return [meterToLilypond(flex.meter)];
            if (flex.key) return [keyToLilypond(flex.key)];
            throw 'Never here';
        }
        if (isLongDecoration(flex)) return [flex];
        throw 'other music event';
    }
    if (R.is(Array)(flex)) return R.chain(flexibleItemToDef, flex);
    if (isSeqFunction(flex)) return [flex];
    if (isVariableRef(flex)) return [flex];
    
    if (isString(flex)) {
        if (flex.trim() === '') return [];
        return [flex];
    }
    if (isSplitSequence(flex)) return [flex];
    
    throw 'Never here';
}

function calcElements(items: FlexibleItem[], repo: VariableRepository): MusicEvent[] {
    return new FlexibleSequence(items, repo, true).elements;
}

export class FlexibleSequence extends BaseSequence {

    constructor(init: FlexibleItem, private repo: VariableRepository = createRepo({}), alreadySplit = false) {
        super();

        const def = flexibleItemToDef(init);
        this.conceptualData = convertSequenceDataToConceptual(def, repo.vars);

        if (!alreadySplit) repo.observer$.subscribe(newRepo => {
            this.def = recursivelySplitStringsIn(def, newRepo);

            this.conceptualData = convertSequenceDataToConceptual(def, newRepo.vars);
        });
        this.def = alreadySplit ? def as FlexibleItem[] : recursivelySplitStringsIn(init, repo);
    }

    private conceptualData: ConceptualSequence;

    get elements(): MusicEvent[] {
        return conceptualGetElements(this.conceptualData);
    }

    get duration(): TimeSpan {
        const elm = this.requireElements();
        return elm.reduce((prev, curr) => Time.addSpans(prev, getDuration(curr)), Time.NoTime);
    }

    get count(): number {
        const elm = this.requireElements();
        return elm.reduce((prev, curr) => isFlexibleSequence(curr) ? prev + curr.count : prev + 1, 0);
    }

    private _asObject: SequenceDef = [];
    public get asObject(): SequenceDef {
        return this.def as SequenceDef;
    }
    public set asObject(value: SequenceDef) {
        this.def = value as FlexibleItem[];
    }

    //private _def!: FlexibleItem[];
    public get def(): FlexibleItem[] {
        return convertConceptualSequenceToData(this.conceptualData) as FlexibleItem[];
        /*if (!R.is(Array, this._def))
            return simplifyDef(this._def) as any;
        return this._def.map(simplifyDef);*/
    }
    private set def(init: FlexibleItem[]) {
        if (!init) init = [];

        //this._def = init;

        const def = flexibleItemToDef(init);
        this.conceptualData = convertSequenceDataToConceptual(def, this.repo.vars);

    }


    private requireElements() {
        return this.elements;
    }

    modifyItem(lens: R.Lens<FlexibleItem, FlexibleItem>, changer: (x: FlexibleItem) => FlexibleItem): void {
        R.over(lens, changer);
    }


    indexToPath(index: number): PathElement<MusicEvent>[] {

        const itemsToPaths = (item: FlexibleItem): PathElement<MusicEvent>[][] => {
            if (typeof item === 'string') {
                const no = splitByNotes(item).length;
                return R.range(0, no).map(n => [n]);
            } else if (isSeqFunction(item)) {
                return createFunction(item.function, item.extraArgs)(calcElements([item.args], this.repo))
                    .map((a, i) => [
                        { 
                            function: createFunction(item.function, item.extraArgs), 
                            inverse: createInverseFunction(item.function, item.extraArgs)
                        } as FunctionPathElement<MusicEvent[]>, 
                        i, 
                        0
                    ]);
            } else if (isVariableRef(item)) {
                const varSeq = valueOf(this.repo, item.variable);
                return varSeq.elements.map((e, i) => [{ variable: item.variable }, ...varSeq.indexToPath(i)]); //{ variable: item.variable }
            } else if (isMusicEvent(item)) {
                return [[0]];
            } else if (isSplitSequence(item)) {
                throw 'Not supported b';        
            } else {
                return (R.addIndex as addIndexFix<FlexibleItem, PathElement<MusicEvent>[][]>)(R.chain<FlexibleItem, PathElement<MusicEvent>[]>)(
                    (s: FlexibleItem, idx: number) => itemsToPaths(s).map(
                        x => x.length > 1 && typeof x[0] === 'string' ? x : [idx, ...x]
                    ), item
                );
            }
        };
        
        const allPaths = itemsToPaths(this.def);

        if (index >= allPaths.length) throw 'Illegal index';

        return allPaths[index];
    }


    indexToPathC(index: number): PathElement<MusicEvent>[] {

        const itemsToPaths = (item: ConceptualSequenceItem): PathElement<MusicEvent>[][] => {
            if (typeof item === 'string') {
                const no = splitByNotes(item).length;
                return R.range(0, no).map(n => [n]);
            } else if (isConceptualFunctionCall(item as ConceptualSequenceItem)) {
                throw 'Not supported a';
                /*return createFunction(item.function, item.extraArgs)(calcElements([item.args], this.repo))
                    .map((a, i) => [
                        { 
                            function: createFunction(item.function, item.extraArgs), 
                            inverse: createInverseFunction(item.function, item.extraArgs)
                        } as FunctionPathElement<MusicEvent[]>, 
                        i, 
                        0
                    ]);*/
            } else if (isConceptualVarRef(item)) {
                //throw 'Not supported ba';
                const varSeq = valueOf(this.repo, item.name);
                return item.items.map((e, i) => [1, { variable: item.name }, ...varSeq.indexToPath(i)]); //{ variable: item.variable };
                /*const varSeq = valueOf(this.repo, item.name);
                return varSeq.elements.map((e, i) => [{ variable: item.variable }, ...varSeq.indexToPath(i)]); //{ variable: item.variable }*/
            } else if (isMusicEvent(item)) {
                return [[0]];
            } else if (isSplitSequence(item)) {
                throw 'Not supported b';
            } else {
                throw 'Not supported d';
            }
            throw 'Not supported c';
        };
        
        
    
        const allPaths = (R.addIndex as addIndexFix<ConceptualSequenceItem, PathElement<MusicEvent>[][]>)(R.chain<ConceptualSequenceItem, PathElement<MusicEvent>[]>)(
            (s: ConceptualSequenceItem, idx: number) => itemsToPaths(s).map(
                x => x.length > 1 && typeof x[0] === 'string' ? x : [idx, ...x]
            ), this.conceptualData
        );
        //itemsToPaths(this.conceptualData);

        if (index >= allPaths.length) throw 'Illegal index';

        return allPaths[index];
    }

    updateElement(index: number, func: (elem: ConceptualSequenceItem) => ConceptualSequenceItem[]): ConceptualSequenceItem {
        const before = this.conceptualData[index];
        const changed = func(before);
        const y = R.remove(index, 1, this.conceptualData); 
        this.conceptualData = R.insertAll(index, changed, y);
        return before;
    }

    appendElements(elements: FlexibleItem[]): void {
        const elems = convertSequenceDataToConceptual(elements.map(flexibleItemToDef), this.repo.vars);

        this.updateElement(this.conceptualData.length - 1, x => [x, ...elems]);
    }    


    deleteElement(i: number | AbsoluteTime): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i);

        if (path.length === 2) {
            this.updateElement(path[0] as number, () => []);
            return;
        }

        throw 'Not implemented';
    }

    modifyElement(i: number | AbsoluteTime, fn: (from: FlexibleItem) => FlexibleItem[]): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i);
        
        if (path.length === 2) {
            const conceptualFn = (from: ConceptualSequenceItem): ConceptualSequenceItem[] => {
                const input: FlexibleItem = convertConceptualSequenceToData([from]);
                const res = convertSequenceDataToConceptual(flexibleItemToDef(fn(input)), this.repo.vars);
                return res;
            };

            this.updateElement(path[0] as number, conceptualFn);

            return;
        }
        

        throw 'Not implemented';

    }    


    insertElements(i: number | AbsoluteTime, elements: FlexibleItem[]): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i);
        //[1,0] tager def og indsætter element før index 1
        if (path.length === 2) {
            const elem = convertSequenceDataToConceptual(elements.map(flexibleItemToDef), this.repo.vars);
            
            this.updateElement(path[0] as number, x => [...elem, x]);
            return;
        }
        

        throw 'Not implemented';
 
    }    
}

export function isFlexibleSequence(test: unknown): test is FlexibleSequence {
    return !!test && (test as FlexibleSequence).constructor?.name === 'FlexibleSequence';
}