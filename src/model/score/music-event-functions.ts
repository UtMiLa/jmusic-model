import { UpdateNote } from './../notes/note';
import { multiply } from 'ramda';

import { Note, cloneNote } from '../notes/note';
import { Spacer, isSpacer } from '../notes/spacer';
import { Interval, addInterval, diffPitch } from '../pitches/intervals';
import { Pitch } from '../pitches/pitch';
import { RationalDef } from '../rationals/rational';
import { Key } from '../states/key';
import { StateChange } from '../states/state';
import { LongDecoFunc, MusicEventFunc, NoteFunc, SpacerFunc, StateFunc } from './function-types';
import { MusicEvent, getDuration, isKeyChange, isLongDecoration, isNote, isStateChange } from './sequence';
import { Time, TimeSpan } from '../rationals/time';
import { LongDecorationElement } from '../data-only/decorations';
import R = require('ramda');


export interface MatchEventStruct {
    note: NoteFunc,
    spacer: SpacerFunc,
    state: StateFunc,
    longDeco: LongDecoFunc
}


export const matchEvent = (struct: MatchEventStruct) => (element: MusicEvent): MusicEvent[] => {
    if (isNote(element)) return struct.note(element);
    if (isSpacer(element)) return struct.spacer(element);
    if (isStateChange(element)) return struct.state(element);
    if (isLongDecoration(element)) return struct.longDeco(element);
    throw 'Fail';
};


export function identity(element: MusicEvent): MusicEvent[] {
    return [element];
}

export function empty(element: MusicEvent): MusicEvent[] {
    return [];
}

const transposePitch = ((interval: Interval, pitch: Pitch) => addInterval(pitch, interval));
const _transposeNote = ((interval: Interval, note: Note) => ({...note, pitches: note.pitches.map(pitch => transposePitch(interval, pitch))}));

export const transposeNote = (interval: Interval) => (element: Note): MusicEvent[] => {
    return [_transposeNote(interval, element)];
};

export const transposeKey = (interval: Interval) => (element: StateChange): MusicEvent[] => {
    if (isKeyChange(element)) {
        const key = element.key as Key;
        return [{ isState: true, key: key.transpose(interval) }];
    }
    return [element];
};

const invertPitch = (center: Pitch) => (input: Pitch): Pitch => {
    const interval = diffPitch(center, input);
    return addInterval(center, interval);
};

export const invertNote = (center: Pitch) => (element: Note): MusicEvent[] => {
    if (!element.pitches || !element.pitches.length) return [element];
    return [cloneNote(element, { pitches: element.pitches.map(invertPitch(center)) })];
};

export const updateNote = (add: UpdateNote) => (element: Note): MusicEvent[] => {
    if (!element.pitches || !element.pitches.length) return [element];
    return [cloneNote(element, add)];
};

const augmentNote = (r: RationalDef) => (n: Note) => {
    return [cloneNote(n, { nominalDuration: Time.scale(n.nominalDuration, r.numerator, r.denominator) })];
};
const augmentSpacer = (r: RationalDef) => (s: Spacer) => {
    return [{...s, duration: Time.scale(s.duration, r.numerator, r.denominator) }];
};
const augmentLongDeco = (r: RationalDef) => (s: LongDecorationElement) => {
    return [{...s, length: Time.scale(s.length, r.numerator, r.denominator) }];
};

export const augment = (r: RationalDef): MusicEventFunc => matchEvent({
    note: augmentNote(r),
    spacer: augmentSpacer(r),
    state: identity,
    longDeco: augmentLongDeco(r)
});

const tremoloNote = (span: TimeSpan) => (n: Note): MusicEvent[] => {
    const totalTime = getDuration(n);
    const numberOfNotes = Time.scale(totalTime, span.denominator, span.numerator);
    if (numberOfNotes.denominator !== 1) throw 'Cannot tremulate shorter values';
    const newNote = cloneNote(n, { nominalDuration: span });
    return R.repeat(newNote, numberOfNotes.numerator);
};

export const tremolo = (span: TimeSpan): MusicEventFunc => matchEvent({
    note: tremoloNote(span),
    spacer: identity,
    state: identity,
    longDeco: identity
});
