import { PhysicalHorizVarSizeElement, PhysicalElementBase } from './physical-elements';
import { NoteRef } from './../../logical-view/view-model/note-view-model';


export interface PhysicalLongElement {
    addNote(noteRef: NoteRef, notestem: PhysicalHorizVarSizeElement, output: PhysicalElementBase[]): boolean;
}