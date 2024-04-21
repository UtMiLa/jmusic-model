import { StateChange } from './../../model/states/state';
import { FuncDef, Key, MeterFactory, MusicEvent, Note, Pitch, PitchClass, RationalDef, SeqFunction, Time, TimeSpan, VariableRef, createNote, 
    fromLilypondAlteration, fromLilypondOctave, fromLilypondPitchClass, isFuncDef, parseLilyClef } from '../../model';
import { many, mapResult, optional, select, sequence } from './argument-modifiers';
import { Spacer, createSpacerFromLilypond } from '../../model/notes/spacer';
import { parseLilyNoteExpression } from '../../model/notes/note-expressions';
import { ArgumentType, IntegerArg, FixedArg, RationalArg as R0, WordArg as W0, WhitespaceArg, _eitherToException, ArgType, _exceptionToEither } from './base-argument-types';


const RationalArg = (R0);
const WordArg = (W0);


export const VoiceNoArg: ArgType<[number | undefined, number]> = (input: string) => {
    const m = /^((\d+)[:.])?(\d+)/.exec(input);
    if (!m) return either.left('Not a voice number');
    const rest = input.substring(m[0].length);
    return either.right([[
        m[1] ? parseInt(m[1]) : undefined,
        parseInt(m[3])
    ], rest]);

};


export const PitchClassArg: ArgType<PitchClass> = (input: string) => {
    const matcher = /^([a-g])((es|is)*)/;
    const parsed = matcher.exec(input);
    
    if (!parsed || parsed.length < 2) return either.left('Illegal pitch class: '+ input);

    const alteration = fromLilypondAlteration(parsed[2]);
    const pitchClass = fromLilypondPitchClass(parsed[1]);

    return either.right([new PitchClass(pitchClass, alteration), input.substring(parsed[0].length)]);

};

export const OctaveArg: ArgType<number> = (input: string) => {
    const items = /^[',]*/.exec(input);

    if (items) {
        const m = fromLilypondOctave(items[0]);
        return either.right([m, input.substring(items[0].length)]);
    }
    return either.left('Illegal octave');

};

export const PitchArg: ArgType<Pitch> = mapResult((sequence([(PitchClassArg), (OctaveArg)])), ([pc, oct]) => new Pitch(pc.pitchClass, oct, pc.alteration));

export const ChordArg: ArgType<Pitch[]> = mapResult((sequence(['<', (many(_eitherToException(PitchArg))), '>'])), pitches => pitches[0]);

export const DurationArg: ArgType<TimeSpan> = mapResult((sequence([(IntegerArg), (many(_eitherToException(FixedArg(/\./)), '', true))])), 
    ([dur, dots]) => (dots ?? []).reduce(
        (prev, next) => next === '.' ? Time.newSpan(prev.numerator * 2 + 1, prev.denominator * 2) : prev, 
        Time.newSpan(1, dur)
    ));

export const NoteExpressionArg: ArgType<string> = FixedArg(/\\[a-z]+/);
export const NoteTieArg: ArgType<string> = FixedArg('~');
export const OptionalNoteExpressionsArg: ArgType<string[] | null> = mapResult((many(_eitherToException(NoteExpressionArg), '\\s*', true)), res => res ? res : null);
const ChordPitchOrRestArg: ArgType<Pitch[]> = (select([
    (mapResult((PitchArg), pitch => [pitch])), 
    (ChordArg),
    (mapResult((FixedArg('r')), () => []))
]));

export const NoteArg: ArgType<Note> = mapResult((sequence<Pitch[], TimeSpan, string[] | null, string | null>([
    (ChordPitchOrRestArg), 
    (DurationArg), 
    (OptionalNoteExpressionsArg),
    (optional((NoteTieArg)))])), 
args => createNote(args[0], args[1], !!args[3], args[2] && args[2].length ? args[2].map(parseLilyNoteExpression) : undefined));


export const SpacerArg: ArgType<Spacer> = (input: string) => {
    const items = input.split(/\s+/);
    if (items.length) {
        const m = createSpacerFromLilypond(items[0]);
        items.shift();
        return either.right([m, items.join(' ')]);
    }
    return either.left('Illegal spacer');
};

const _keyArg = (sequence([(IntegerArg), (select([FixedArg('#'), FixedArg('b')]))]));
export const KeyArg = (mapResult(_keyArg, ([count, acc]) => (StateChange.newKeyChange(new Key({ count, accidental: acc === '#' ? 1 : -1 })))));

export const MeterArg = (mapResult((RationalArg), (r: RationalDef) => (StateChange.newMeterChange(MeterFactory.createRegularMeter({ count: r.numerator, value: r.denominator })))));

const _clefArg = (sequence([FixedArg(/\\clef /), WordArg]));
export const ClefArg = (mapResult(_clefArg, ([keyword, value]) => (StateChange.newClefChange(parseLilyClef(value)))));

export const VariableReferenceArg = mapResult((sequence(['\\$', WordArg])), ([word]) => ({ variable: word } as VariableRef));

import { FunctionArg } from './function-argument-types';
import { either } from 'fp-ts';

export const MusicEventArg = _eitherToException(select(
    [(NoteArg), KeyArg, MeterArg, ClefArg, SpacerArg, (VariableReferenceArg), (FunctionArg)])
); // todo: LongDecoration, ...
