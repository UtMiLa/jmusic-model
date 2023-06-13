import R = require('ramda');
import { Note, setGrace, setPitches, setTupletFactor, setTupletGroup, TupletState } from '../notes/note';
import { addInterval, diffPitch, Interval } from '../pitches/intervals';
import { Pitch } from '../pitches/pitch';
import { RationalDef } from '../rationals/rational';
import { TimeSpan, AbsoluteTime } from '../rationals/time';
import { FlexibleSequence } from './flexible-sequence';
import { BaseSequence, ISequence, isNote, MusicEvent, TimeSlot } from './sequence';
import { SeqFunction, FuncDef } from './types';

/* todo functions:
    repeatFor       [# of times]            repeat for a timespan
    repeatUntil     [absTime or fixpoint]   repeat until an absoluteTime (which can be a variable timeMark defined in another voice)
    extendFor       [absTime]               extend a note
    extendUntil     [fixpoint]
    restFor         [absTime]               rest
    restUntil       [fixpoint]

    transposeModal  [interval; scale/key]   transpose using a scale or a key
    transposeChrom  [interval]              transpose chromatically
    duxToComes      [key]                   replace 5th with 4th (complicated; not fixed rule)

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


    might be defined like mongoDb: match unwind project group sort



    suggestion: a domain language to construct functions:

        transposeChromatic: interval ->
            note -> modify(pitches, map(addInterval(interval)))
            key -> transposeKey(interval)
            others -> keep
        offset: timeSpan -> 
            others -> prepend(rest(timeSpan))
        merge: sequence ->
            notes -> zip(sequence.notes) -> modify(duration, zipped.duration)
            others -> keep
        reverse:
            note -> reverse
            longDecoration -> invertDeco()
            others -> skip
*/

export function isSeqFunction(test: unknown): test is SeqFunction {
    return !!(test as SeqFunction).function && !!(test as SeqFunction).args;
}

type MusicFunc = (elements: MusicEvent[]) => MusicEvent[];
type CurryMusicFunc = (...args: unknown[]) => MusicFunc;

const repeater = R.repeat;
const flippedRepeater = R.flip(repeater);
const flattenedRepeater = R.curry(R.pipe(flippedRepeater, R.flatten as any));

const reverseTuplets = R.modify<'tupletGroup', TupletState, TupletState>('tupletGroup', 
    (tg: TupletState) => tg === TupletState.Begin
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


const transposePitch = R.curry((interval: Interval, pitch: Pitch) => addInterval(pitch, interval));
const transposeNote = R.curry((interval: Interval, note: Note) => ({...note, pitches: note.pitches.map(pitch => transposePitch(interval, pitch))}));

const transpose = R.curry((interval, sequence: MusicEvent[]) => R.map(R.when(isNote, transposeNote(interval)))(sequence));

const relativeOctave = (prevPitch: Pitch, currPitch: Pitch): number => {
    const firstPitch = currPitch;
    const fromOctave = prevPitch.octave;
    const toOctave = firstPitch.octave;

    const pcDiff = prevPitch.pitchClassNumber - firstPitch.pitchClassNumber;
    const correctionNumber = Math.trunc(pcDiff / 4);
    const octave = fromOctave + toOctave - 3 + correctionNumber;

    return octave;
};

const relative = R.curry((pitch: Pitch, seq: MusicEvent[]) => seq.reduce<{accu: MusicEvent[], pitch: Pitch}>((prev: {accu: MusicEvent[], pitch: Pitch}, curr: MusicEvent) => {
    if (isNote(curr) && curr.pitches.length) {
        
        const pitchesTemp = curr.pitches.reduce<{ accu: Pitch[], pitch: Pitch }>((prev1, curr1: Pitch) => {
            const pitchOctave = relativeOctave(prev1.pitch, curr1);
            const newPitch = new Pitch(curr1.pitchClassNumber, pitchOctave, curr1.alteration);
            return {
                accu: [... prev1.accu, newPitch],
                pitch: newPitch
            };
        }, {
            accu: [],
            pitch: prev.pitch
        });
        const curr1 = setPitches(curr, pitchesTemp.accu);

        return { accu: [...prev.accu, curr1], pitch: curr1.pitches[0] };
    } else {
        return { accu: [...prev.accu, curr], pitch: prev.pitch };
    }
}, { accu: [], pitch: typeof(pitch) === 'string' ? Pitch.parseLilypond(pitch) : pitch }).accu);

const internal_functions: {[key: string]: MusicFunc | CurryMusicFunc } = {
    'Relative': relative as CurryMusicFunc,
    'Reverse': R.pipe(R.reverse<MusicEvent>, R.map(reverseTuplets)),
    'Repeat': flattenedRepeater as CurryMusicFunc,
    'Grace': R.map(setGraceNote),
    'Tuplet': R.curry(setTupletNotes) as CurryMusicFunc,
    'Transpose': transpose as CurryMusicFunc,
    'ModalTranspose': R.identity
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