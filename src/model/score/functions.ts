import R = require('ramda');
import { TimeSpan, AbsoluteTime } from '../rationals/time';
import { FlexibleItem, FlexibleSequence } from './flexible-sequence';
import { BaseSequence, ISequence, MusicEvent, TimeSlot } from './sequence';
export interface SeqFunction {
    function: string;
    args: FlexibleItem[];
}


export function isSeqFunction(test: unknown): test is SeqFunction {
    return !!(test as SeqFunction).function && !!(test as SeqFunction).args;
}

export function createFunction(funcDef: string): (elements: MusicEvent[]) => MusicEvent[] {
    return R.reverse;
}