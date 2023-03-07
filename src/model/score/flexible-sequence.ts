import R = require('ramda');
import { TimeSpan, AbsoluteTime, Time } from '../rationals/time';
import { createFunction, isSeqFunction, SeqFunction } from './functions';
import { BaseSequence, MusicEvent, parseLilyElement, SimpleSequence } from './sequence';


export type FlexibleItem = string | SeqFunction | FlexibleItem[];

function recursivelySplitStringsIn(item: FlexibleItem): FlexibleItem[] {
    if (typeof item === 'string') {
        return SimpleSequence.splitByNotes(item);
    } else if (isSeqFunction(item)) {
        const x = R.modify('args', args => args.map(recursivelySplitStringsIn), item) as unknown as FlexibleItem[];
        return x;
    } else {
        return item.map(i => recursivelySplitStringsIn(i));
    }
}


function calcElements(items: FlexibleItem[]): MusicEvent[] {
    return new FlexibleSequence(items, true).elements;
}

export class FlexibleSequence extends BaseSequence {

    constructor(init: FlexibleItem, alreadySplit = false) {
        super();

        this.def = alreadySplit ? init as FlexibleItem[] : recursivelySplitStringsIn(init);
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
            R.cond<FlexibleItem, string, SeqFunction, string[], FlexibleItem[], MusicEvent[]>([
                [R.is(String), ((item: string) => [parseLilyElement(item) as MusicEvent])],
                [isSeqFunction, (item: SeqFunction) => createFunction(item.function)(calcElements(item.args))],
                [isSingleStringArray, (item: string[]) => [parseLilyElement(item[0])]],
                [isOtherFlexibleItemArray, calcElements]
            ])            
            , init);
    }


    modifyItem(lens: R.Lens<FlexibleItem, FlexibleItem>, changer: (x: FlexibleItem) => FlexibleItem): void {
        R.over(lens, changer);
    }

    insertElement(time: AbsoluteTime, elm: MusicEvent): void {
        throw new Error('Method not implemented.');
    }    
}

export function isFlexibleSequence(test: unknown): test is FlexibleSequence {
    return (test as FlexibleSequence).constructor?.name === 'FlexibleSequence';
}