import { isVariableRef, VariableRef, VariableRepository, VariableDef } from './variables';
import R = require('ramda');
import { TimeSpan, AbsoluteTime, Time } from '../rationals/time';
import { createFunction, isSeqFunction, SeqFunction } from './functions';
import { BaseSequence, MusicEvent, parseLilyElement, SimpleSequence } from './sequence';

// Fix for types for R.chain
import * as _ from 'ts-toolbelt';
type addIndexFix<T, U> = (
    fn: (f: (item: T) => U, list: readonly T[]) => U,
) => _.F.Curry<(a: (item: T, idx: number, list: T[]) => U, b: readonly T[]) => U>;


export type FlexibleItem = string | SeqFunction | VariableRef |FlexibleItem[];

function recursivelySplitStringsIn(item: FlexibleItem, repo: VariableRepository): FlexibleItem[] {
    if (typeof item === 'string') {
        return SimpleSequence.splitByNotes(item);
    } else if (isSeqFunction(item)) {
        const x = R.modify('args', args => recursivelySplitStringsIn(args, repo), item) as unknown as FlexibleItem[];
        return x;
    } else if (isVariableRef(item)) {
        return new FlexibleSequence(repo.valueOf(item.variable)).def;
    } else {
        return item.map(i => recursivelySplitStringsIn(i, repo));
    }
}


function calcElements(items: FlexibleItem[], repo: VariableRepository): MusicEvent[] {
    return new FlexibleSequence(items, repo, true).elements;
}

export class FlexibleSequence extends BaseSequence {

    constructor(init: FlexibleItem, private repo: VariableRepository = new VariableRepository([]), alreadySplit = false) {
        super();

        if (!alreadySplit) repo.observer$.subscribe(newRepo => {
            this.def = recursivelySplitStringsIn(init, newRepo);
        });
        this.def = alreadySplit ? init as FlexibleItem[] : recursivelySplitStringsIn(init, repo);
    }

    private _elements: MusicEvent[] = [];

    get elements(): MusicEvent[] {
        return R.flatten(this._elements.map((item) => isFlexibleSequence(item) ? item.elements : [item]));
    }

    get duration(): TimeSpan {
        return this._elements.reduce((prev, curr) => Time.addSpans(prev, curr.duration), Time.NoTime);
    }

    get count(): number {
        return this._elements.reduce((prev, curr) => isFlexibleSequence(curr) ? prev + curr.count : prev + 1, 0);
    }

    private _def!: FlexibleItem[];
    public get def(): FlexibleItem[] {
        return this._def;
    }
    public set def(init: FlexibleItem[]) {
        this._def = init;

        function isSingleStringArray(test: unknown): test is string[] {
            return (test as string[]).length === 1 && typeof ((test as string[])[0]) === 'string';
        }
        
        function isOtherFlexibleItemArray(test: unknown): test is FlexibleItem[] {
            return true;
        }
        
        this._elements = R.chain(
            R.cond<FlexibleItem, string, SeqFunction, /*VariableRef,*/ string[], FlexibleItem[], MusicEvent[]>([
                [R.is(String), ((item: string) => [parseLilyElement(item) as MusicEvent])],
                [isSeqFunction, (item: SeqFunction) => createFunction(item.function, item.extraArgs)(calcElements([item.args], this.repo))],
                //[isVariableRef, (item: VariableRef) => calcElements([(this.repo.valueOf(item.variable)], this.repo)],
                [isSingleStringArray, (item: string[]) => [parseLilyElement(item[0])]],
                [isOtherFlexibleItemArray, (elm) => calcElements(elm, this.repo)]
            ])            
            , init);
    }


    modifyItem(lens: R.Lens<FlexibleItem, FlexibleItem>, changer: (x: FlexibleItem) => FlexibleItem): void {
        R.over(lens, changer);
    }


    indexToPath(index: number): (number | string)[] {

        const itemsToPaths = (item: FlexibleItem): (number | string)[][] => {
            if (typeof item === 'string') {
                const no = SimpleSequence.splitByNotes(item).length;
                return R.range(0, no).map(n => [n]);
            } else if (isSeqFunction(item)) {
                //const x = R.modify('args', args => recursivelySplitStringsIn(args, repo), item) as unknown as FlexibleItem[];
                return [];
            } else if (isVariableRef(item)) {
                return [];//new FlexibleSequence(repo.valueOf(item.variable)).def;
            } else {
                return (R.addIndex as addIndexFix<FlexibleItem, (number|string)[][]>)(R.chain<FlexibleItem, (number|string)[]>)((s: FlexibleItem, idx: number) => itemsToPaths(s).map(x => [idx, ...x]), item);
            }
        };
        
        const allPaths = itemsToPaths(this.def);

        if (index >= allPaths.length) throw 'Illegal index';

        return allPaths[index];
    }

    insertElement(time: AbsoluteTime, elm: MusicEvent): void {
        throw new Error('Method not implemented.');
    }    
}

export function isFlexibleSequence(test: unknown): test is FlexibleSequence {
    return !!test && (test as FlexibleSequence).constructor?.name === 'FlexibleSequence';
}