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

/* todo functions:
    repeatFor       [# of times]            repeat for a timespan
    repeatUntil     [absTime or fixpoint]   repeat until an absoluteTime (which can be a variable timeMark defined in another voice)
    extendFor       [absTime]               extend a note
    extendUntil     [fixpoint]
    restFor         [absTime]               rest
    restUntil       [fixpoint]

    transposeModal  [interval; scale/key]   transpose using a scale or a key
    transposeChrom  [interval]              transpose chromatically

    invertModal     [centerNote; scale/key] inversion using a scale or a key
    invertChrom     [centerNote]            chromatical inversion

    augment         [factor]                change all values by a factor (or a fixed value)
    mensuration     [fromTime; toTime]      change all values by mensuration rules
    replaceValue    [fromValue; toValue; mode]    replace a time value with another
                                                and fill with rests (c2 d4. e8 -> c8 r4. d8 r4 e8)
                                                and repeat notes (c2 d4. e8 -> c8 c8 c8 c8 d8 d8 d8 e8)
                                                and change rhythm (c2 d4. e8 -> c8 d8 e8)

    replacePattern  (complex)

    cut             [time1; time2]          from time1 to time2

    sample          [sampleSeq]             c16 d16 e16 f16 g16 a16 b16 c16 | x8. x8. x8 -> c8. f8. b8

    merge           [valueSeq]              values from seq1 with pitches from seq2

    addPassing      []                      adds passing notes: c4 e4 c4 -> c8 d8 e8 d8 c4

    arpeggiate      [patternSeq]            makes chords to arpeggios or Alberti-bass-like sequences
    collapse        [chordValues]           make arpeggios to chords

    offset          [timeSpan]              delays the beginning of the sequence

    chordToVoice    [voiceNo; totalNo]      
*/

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