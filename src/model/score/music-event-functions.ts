
import { Note } from '../notes/note';
import { isSpacer } from '../notes/spacer';
import { Interval, addInterval } from '../pitches/intervals';
import { Pitch } from '../pitches/pitch';
import { LongDecoFunc, MusicEventFunc, NoteFunc, SpacerFunc, StateFunc } from './function-types';
import { MusicEvent, isLongDecoration, isNote, isStateChange } from './sequence';


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

