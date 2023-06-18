import { Note, createNoteFromLilypond } from "..";

/** Tolerant input type for notes: a Note object, or a string in Lilypond format */
export type NoteFlex = Note | string;



export function makeNote(input: NoteFlex): Note {

    if (typeof (input) === 'string') {
        return createNoteFromLilypond(input);
    }
    return input as Note;
}
