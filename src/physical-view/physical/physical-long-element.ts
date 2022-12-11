import { VertVarSizeGlyphs } from './glyphs';
import { Time } from './../../model/rationals/time';
import { Metrics } from './metrics';
import { LongDecorationViewModel } from './../../logical-view/view-model/convert-decoration';
import { PhysicalHorizVarSizeElement, PhysicalElementBase, PhysicalTupletBracketElement } from './physical-elements';
import { NoteRef } from './../../logical-view/view-model/note-view-model';
import { LongDecorationType } from '~/model';


export interface PhysicalLongElement {
    addNote(noteRef: NoteRef, notestem: PhysicalHorizVarSizeElement, output: PhysicalElementBase[]): boolean;
}


export class PhysicalLongDecoration implements PhysicalLongElement {
    constructor(private element: LongDecorationViewModel, private settings: Metrics) {
        //
    }

    private registeredNotes: { [key: string]: PhysicalHorizVarSizeElement } = {};

    testNote(noteRef: NoteRef): boolean {
        const found = this.element.noteRefs.find(ref => Time.equals(ref.absTime, noteRef.absTime) && ref.uniq === noteRef.uniq);        
        
        return !!found;
    }

    glyphFromElement(): VertVarSizeGlyphs {
        switch(this.element.type) {
            case LongDecorationType.Crescendo: return VertVarSizeGlyphs.Crescendo;
            case LongDecorationType.Decrescendo: return VertVarSizeGlyphs.Decrescendo;
            case LongDecorationType.Slur: return VertVarSizeGlyphs.Slur;   
        }
        throw 'Unknown long decoration type: ' + this.element.type;
    }

    addNote(noteRef: NoteRef, notestem: PhysicalHorizVarSizeElement, output: PhysicalElementBase[]): boolean {
        if (this.testNote(noteRef)) {
            this.registeredNotes[noteRef.uniq] = notestem;

            //console.log('adding note, testnote ok', noteRef, this.bvm, this.registeredNotes);    
        
            if (Object.keys(this.registeredNotes).length === this.element.noteRefs.length) {

                const firstNote = this.getNotestem(0);
                //sign = Math.sign(firstNote.height);
                const firstXPos = firstNote.position.x;

                console.log('this.glyphFromElement(),', this.glyphFromElement());

                output.push({
                    element: this.glyphFromElement(),
                    position: { x: firstXPos, y: 50 },
                    length: 30,
                    height: 0
                } as PhysicalElementBase);
            }
        }
        return false;
    }
    
    getNotestem(idx: number): PhysicalHorizVarSizeElement {
        return this.registeredNotes[this.element.noteRefs[idx].uniq];
    }
}