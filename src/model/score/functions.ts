import R = require('ramda');
import { TimeSpan, AbsoluteTime } from '../rationals/time';
import { FlexibleItem, FlexibleSequence } from './flexible-sequence';
import { BaseSequence, ISequence, MusicEvent, TimeSlot } from './sequence';
export interface SeqFunction {
    function: FuncDef;
    args: FlexibleItem[];
}


export function isSeqFunction(test: unknown): test is SeqFunction {
    return !!(test as SeqFunction).function && !!(test as SeqFunction).args;
}

export type FuncDef = 'Reverse' | 'Repeat';

const internal_functions = {
    'Reverse': R.reverse,
    'Repeat': R.pipe(n => R.repeat(n, 2), R.flatten)
};

export function createFunction(funcDef: FuncDef): (elements: MusicEvent[]) => MusicEvent[] {
    return internal_functions[funcDef];
}