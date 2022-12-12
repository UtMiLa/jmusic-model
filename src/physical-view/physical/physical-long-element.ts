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

export abstract class PhysicalLongElementBase {
    constructor(protected noteRefs: NoteRef[], protected settings: Metrics) {

    }

    protected registeredNotes: { [key: string]: PhysicalHorizVarSizeElement } = {};

    testNote(noteRef: NoteRef): boolean {
        const found = this.noteRefs.find(ref => Time.equals(ref.absTime, noteRef.absTime) && ref.uniq === noteRef.uniq);        
        
        return !!found;
    }

    getNotestem(idx: number): PhysicalHorizVarSizeElement {
        return this.registeredNotes[this.noteRefs[idx].uniq];
    }

    abstract finishObject(output: PhysicalElementBase[]): void;

    addNote(noteRef: NoteRef, notestem: PhysicalHorizVarSizeElement, output: PhysicalElementBase[]): boolean {
        if (this.testNote(noteRef)) {
            this.registeredNotes[noteRef.uniq] = notestem;

            //console.log('adding note, testnote ok', noteRef, this.bvm, this.registeredNotes);    
        
            if (Object.keys(this.registeredNotes).length === this.noteRefs.length) {

                this.finishObject(output);

                return true;
            }
        }
        return false;
    }
    

}

export class PhysicalLongDecoration extends PhysicalLongElementBase {
    constructor(element: LongDecorationViewModel, settings: Metrics) {
        super(element.noteRefs, settings);
        this.glyphType = this.glyphFromElement(element);
    }

    private glyphType: VertVarSizeGlyphs;

    glyphFromElement(element: LongDecorationViewModel): VertVarSizeGlyphs {
        switch(element.type) {
            case LongDecorationType.Crescendo: return VertVarSizeGlyphs.Crescendo;
            case LongDecorationType.Decrescendo: return VertVarSizeGlyphs.Decrescendo;
            case LongDecorationType.Slur: return VertVarSizeGlyphs.Slur;   
        }
        throw 'Unknown long decoration type: ' + element.type;
    }


    finishObject(output: PhysicalElementBase[]): void {
        const firstNote = this.getNotestem(0);
        //sign = Math.sign(firstNote.height);
        const firstXPos = firstNote.position.x;

        const lastNote = this.getNotestem(1);
        const lastXPos = lastNote.position.x;

        //console.log('this.glyphFromElement(),', this.glyphFromElement());
        output.push({
            element: this.glyphType,
            position: { x: firstXPos, y: this.settings.dynamicY },
            length: lastXPos - firstXPos,
            height: 0
        } as PhysicalElementBase);
    }
}