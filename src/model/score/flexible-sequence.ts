import { VariableRef } from './../data-only/variables';
import { SeqFunction } from './../data-only/functions';
import { SequenceDef, FlexibleItem, SplitSequenceDef } from './..';
import { createRepo, isVariableRef, valueOf, VariableRepository } from './variables';
import R = require('ramda');
import { TimeSpan, AbsoluteTime, Time } from '../rationals/time';
import { createFunction, createInverseFunction } from './functions';
import { BaseSequence, getDuration, isMusicEvent, isNote, MusicEvent, parseLilyElement, SimpleSequence, splitByNotes } from './sequence';

// Fix for types for R.chain
import * as _ from 'ts-toolbelt';
import { isSplitSequence } from '..';
import { Note, noteAsLilypond } from '../notes/note';
import { isSeqFunction } from '../data-only/functions';
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

function calcElements(items: FlexibleItem[], repo: VariableRepository): MusicEvent[] {
    return new FlexibleSequence(items, repo, true).elements;
}

function isSingleStringArray(test: unknown): test is string[] {
    return (test as string[]).length === 1 && typeof ((test as string[])[0]) === 'string';
}

function isOtherFlexibleItemArray(test: unknown): test is FlexibleItem[] {
    return true;
}

export class FlexibleSequence extends BaseSequence {

    constructor(init: FlexibleItem, private repo: VariableRepository = createRepo({}), alreadySplit = false) {
        super();

        if (!alreadySplit) repo.observer$.subscribe(newRepo => {
            this.def = recursivelySplitStringsIn(init, newRepo);
        });
        this.def = alreadySplit ? init as FlexibleItem[] : recursivelySplitStringsIn(init, repo);
    }

    private _elements: MusicEvent[] | undefined = undefined

    get elements(): MusicEvent[] {
        const elm = this.requireElements(isSingleStringArray, isOtherFlexibleItemArray, this._def);
        return R.flatten(elm.map((item) => isFlexibleSequence(item) ? item.elements : [item]));
    }

    get duration(): TimeSpan {
        const elm = this.requireElements(isSingleStringArray, isOtherFlexibleItemArray, this._def);
        return elm.reduce((prev, curr) => Time.addSpans(prev, getDuration(curr)), Time.NoTime);
    }

    get count(): number {
        const elm = this.requireElements(isSingleStringArray, isOtherFlexibleItemArray, this._def);
        return elm.reduce((prev, curr) => isFlexibleSequence(curr) ? prev + curr.count : prev + 1, 0);
    }

    private _asObject: SequenceDef = [];
    public get asObject(): SequenceDef {
        return this.def as SequenceDef;
    }
    public set asObject(value: SequenceDef) {
        this.def = value as FlexibleItem[];
    }

    private _def!: FlexibleItem[];
    public get def(): FlexibleItem[] {
        if (!R.is(Array, this._def))
            return simplifyDef(this._def) as any;
        return this._def.map(simplifyDef);
    }
    public set def(init: FlexibleItem[]) {
        if (!init) init = [];

        this._def = init;
        this._elements = undefined;
    }


    private requireElements(isSingleStringArray: (test: unknown) => test is string[], isOtherFlexibleItemArray: (test: unknown) => test is FlexibleItem[], init: FlexibleItem[]) {
        if (this._elements === undefined) {
            this._elements = R.chain(
                R.cond([
                    [
                        R.is(String),
                        ((item: string) => item ? [parseLilyElement(item) as MusicEvent] : [])
                    ],                    
                    /*[
                        isMultiSequence,
                        (item: MultiSequence) => R.flatten(item.sequences.map(subSeq => calcElements([subSeq], this.repo)))
                    ],*/
                    [
                        isSeqFunction,
                        (item: SeqFunction) => createFunction(item.function, item.extraArgs)(calcElements([item.args], this.repo))
                    ],
                    [
                        isVariableRef,
                        (item: VariableRef) => calcElements(valueOf(this.repo, item.variable).elements, this.repo) /*.map(timify)*/
                    ],
                    [
                        isSingleStringArray,
                        (item: string[]) => [parseLilyElement(item[0])]
                    ],
                    [
                        isMusicEvent, (item: MusicEvent) => [item]
                    ],
                    [
                        isOtherFlexibleItemArray, (elm) => calcElements(elm, this.repo)
                    ]
                ]),
                init);
        }
        return this._elements;
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

    appendElement(element: FlexibleItem): void {
        if (R.is(Array, this.def)) {
            this.def = R.append(element, this.def);
        } else {
            this.def = [this.def, element];
        }
    }    


    deleteElement(i: number | AbsoluteTime): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i);

        if (path.length === 2) {
            this.def = R.remove(path[0] as number, 1, this.def);
            return;
        }

        throw 'Not implemented';
    }

    modifyElement(i: number | AbsoluteTime, fn: (from: FlexibleItem) => FlexibleItem): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i);
        
        if (path.length === 2) {
            this.def = R.modify(path[0] as number, fn, this.def);
            return;
        }
        

        throw 'Not implemented';

    }    


    insertElement(i: number | AbsoluteTime, element: FlexibleItem): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i);
        //[1,0] tager def og indsætter element før index 1
        if (path.length === 2) {
            this.def = R.insert(path[0] as number, element, this.def);
            return;
        }
        

        throw 'Not implemented';
        /*
        const setPath = (def: FlexibleItem, path: PathElement[], element: MusicEvent) => {
            const [i, ...rest] = path;
            //const thing = def[i];
        };
        */
        //this.def.splice(i, 0, element);

    }    
}

export function isFlexibleSequence(test: unknown): test is FlexibleSequence {
    return !!test && (test as FlexibleSequence).constructor?.name === 'FlexibleSequence';
}