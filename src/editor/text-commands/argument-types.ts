import { FlexibleSequence } from './../../model/score/flexible-sequence';
import { StateChange } from './../../model/states/state';
import { FuncDef, Key, MeterFactory, MusicEvent, Note, NoteBase, NoteDef, Pitch, PitchClass, RationalDef, SeqFunction, SequenceDef, SequenceItem, SplitSequenceDef, Time, TimeSpan, VariableRef, createNote, 
    fromLilypondAlteration, fromLilypondOctave, fromLilypondPitchClass, isFuncDef, parseLilyClef } from '../../model';
import { many, mapResult, optional, select, sequence } from './argument-modifiers';
import { Spacer, createSpacerFromLilypond } from '../../model/notes/spacer';
import { parseLilyNoteExpression } from '../../model/notes/note-expressions';
import { IntegerArg, FixedArg, RationalArg as R0, WordArg as W0, WhitespaceArg, ArgType } from './base-argument-types';


const RationalArg = (R0);
const WordArg = (W0);
export type VoiceNo = [number | undefined, number];

export const VoiceNoArg: ArgType<VoiceNo> = (input: string) => {
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

    const m = fromLilypondOctave(items ? items[0] : '');
    const rest = items ? input.substring(items[0].length) : input;
    return either.right([m, rest]);

};

export const PitchArg: ArgType<Pitch> = mapResult((sequence([(PitchClassArg), (OctaveArg)])), ([pc, oct]) => new Pitch(pc.pitchClass, oct, pc.alteration));

export const ChordArg: ArgType<Pitch[]> = mapResult((sequence(['<', (many((PitchArg))), '>'])), pitches => pitches[0]);

export const DurationArg: ArgType<TimeSpan> = mapResult((sequence([(IntegerArg), (many((FixedArg(/\./)), '', true))])), 
    ([dur, dots]) => (dots ?? []).reduce(
        (prev, next) => next === '.' ? Time.newSpan(prev.numerator * 2 + 1, prev.denominator * 2) : prev, 
        Time.newSpan(1, dur)
    ));

export const NoteExpressionArg: ArgType<string> = FixedArg(/\\[a-z]+/);
export const NoteTieArg: ArgType<string> = FixedArg('~');
export const OptionalNoteExpressionsArg: ArgType<string[] | null> = mapResult((many((NoteExpressionArg), '\\s*', true)), res => res ? res : null);
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
        //const m = createSpacerFromLilypond(items[0]);

        const matcher = /^(s|(\\skip))(\d+\.*)/i;
        const match = matcher.exec(items[0]);
        if (!match || match.length < 2) return either.left('Illegal spacer: ' + items[0]);
    
        const durationString = match[3];
    
        const m = { 
            duration: Time.fromLilypond(durationString), 
            type: 'spacer' 
        } as Spacer;
        items.shift();
        return either.right([m, input.substring(match[0].length)]);
    }
    return either.left('Illegal spacer');
};

const _keyArg = (sequence([(IntegerArg), (select([FixedArg('#'), FixedArg('b')]))]));
export const KeyArg = (mapResult(_keyArg, ([count, acc]) => (StateChange.newKeyChange(new Key({ count, accidental: acc === '#' ? 1 : -1 })))));

export const MeterArg = (mapResult((RationalArg), (r: RationalDef) => (StateChange.newMeterChange(MeterFactory.createRegularMeter({ count: r.numerator, value: r.denominator })))));

const _clefArg = (sequence([FixedArg(/\\clef /), WordArg]));
export const ClefArg = (mapResult(_clefArg, ([keyword, value]) => (StateChange.newClefChange(parseLilyClef(value)))));

export const VariableReferenceArg = mapResult((sequence(['\\$', WordArg])), ([word]) => ({ variable: word } as VariableRef));

export const SplitSequenceArg = mapResult(sequence(['<< *', many(NoteArg), /\s*\\\\\s+/, many(NoteArg),  ' *>>']), ([v1Notes, v2Notes]: [NoteBase[], NoteBase[]]) => {
    return ({
        type: 'multi',
        sequences: [new FlexibleSequence(v1Notes).def, new FlexibleSequence(v2Notes).def]
    });
}) as ArgType<SplitSequenceDef>;

import { FunctionArg } from './function-argument-types';
import { either } from 'fp-ts';

export const MusicEventArg = (select(
    [NoteArg, KeyArg, MeterArg, ClefArg, SpacerArg, VariableReferenceArg, FunctionArg, SplitSequenceArg])
) as ArgType<SequenceItem>; // todo: LongDecoration, SplitSequence ...
