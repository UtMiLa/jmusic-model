import R = require('ramda');
import { Note, setGrace, setTupletFactor, setTupletGroup, TupletState } from '../notes/note';
import { RationalDef } from '../rationals/rational';
import { TimeSpan, AbsoluteTime } from '../rationals/time';
import { FlexibleItem, FlexibleSequence } from './flexible-sequence';
import { BaseSequence, ISequence, isNote, MusicEvent, TimeSlot } from './sequence';
export interface SeqFunction {
    function: FuncDef;
    args: FlexibleItem;
    extraArgs?: unknown[];
}


export function isSeqFunction(test: unknown): test is SeqFunction {
    return !!(test as SeqFunction).function && !!(test as SeqFunction).args;
}

export type FuncDef = 'Reverse' | 'Repeat' | 'Grace' | 'Tuplet';

type MusicFunc = (elements: MusicEvent[]) => MusicEvent[];
type CurryMusicFunc = (...args: unknown[]) => MusicFunc;

const repeater = R.repeat;
const flippedRepeater = R.flip(repeater);
const flattenedRepeater = R.curry(R.pipe(flippedRepeater, R.flatten as any));

const reverseTuplets = R.modify<'tupletGroup', TupletState, TupletState>('tupletGroup', 
    tg => tg === TupletState.Begin
        ? TupletState.End 
        : tg === TupletState.End
            ? TupletState.Begin
            : tg
) as (target: MusicEvent) => MusicEvent;


const setGraceNote = R.when(isNote, (note: Note) => setGrace(note, true));


const setTupletGroupAndFactor = (note: Note, fraction: RationalDef, tupletGroup: number) => setTupletGroup(setTupletFactor(note, fraction), tupletGroup);
const setTupletNote = (note: MusicEvent, fraction: RationalDef, tupletGroup: number) => R.when(isNote, (note: Note) => setTupletGroupAndFactor(note, fraction, tupletGroup), note);
const setTupletNotes = (fraction: RationalDef, notes: MusicEvent[]) => {
    return notes.map((note, i, arr) => setTupletNote(note, fraction, 
        i ? (i === arr.length - 1 ? TupletState.End : TupletState.Inside) : TupletState.Begin
    ));
};

const internal_functions: {[key: string]: MusicFunc | CurryMusicFunc } = {
    'Reverse': R.pipe(R.reverse<MusicEvent>, R.map(reverseTuplets)),
    'Repeat': flattenedRepeater as CurryMusicFunc,
    'Grace': R.map(setGraceNote),
    'Tuplet': R.curry(setTupletNotes) as CurryMusicFunc
};

export function createFunction(funcDef: FuncDef, extraArgs?: unknown[]): (elements: MusicEvent[]) => MusicEvent[] {
    const func = internal_functions[funcDef];
    if (extraArgs && extraArgs.length) {
        const res = (func as CurryMusicFunc)(...extraArgs) as MusicFunc;
        //console.log(res([]));        
        return res;
    }
    return func as MusicFunc;
}