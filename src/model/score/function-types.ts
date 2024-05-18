import { LongDecorationElement } from '../data-only/decorations';
import { Note } from '../notes/note';
import { Spacer } from '../notes/spacer';
import { StateChange } from '../states/state';
import { MusicEvent } from './sequence';

export type MusicFunc = (elements: MusicEvent[]) => MusicEvent[];
export type CurryMusicFunc = (...args: unknown[]) => MusicFunc;


export type MusicEventFunc = (element: MusicEvent) => MusicEvent[];

export type NoteFunc = (element: Note) => MusicEvent[];
export type SpacerFunc = (element: Spacer) => MusicEvent[];
export type StateFunc = (element: StateChange) => MusicEvent[];
export type LongDecoFunc = (element: LongDecorationElement) => MusicEvent[];
