import R = require('ramda');
import { TimeSpan, AbsoluteTime, Time } from '../rationals/time';
import { BaseSequence, MusicEvent, parseLilyElement, SimpleSequence } from './sequence';


export type FlexibleItem = string | FlexibleItem[];

export type FlexibleElement = MusicEvent | FlexibleSequence;

function recursivelySplitStringsIn(item: FlexibleItem): FlexibleItem[] {
    if (typeof item === 'string') {
        return SimpleSequence.splitByNotes(item);
    } else {
        return item.map(i => recursivelySplitStringsIn(i));
    }
}


export class FlexibleSequence extends BaseSequence {

    constructor(init: FlexibleItem, alreadySplit = false) {
        super();

        this.def = alreadySplit ? init as FlexibleItem[] : recursivelySplitStringsIn(init);
    }

    private _elements: FlexibleElement[] = [];

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
        this._elements = init.map(item => {
            if (typeof item === 'string') {
                return parseLilyElement(item);
            } else if (item.length === 1 && typeof (item[0]) === 'string') {
                return parseLilyElement(item[0]);
            } else {
                return new FlexibleSequence(item, true);
            }
        });
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