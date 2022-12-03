import { PhysicalLongElement } from './physical-long-element';
import { Metrics } from './metrics';
import { PhysicalHorizVarSizeElement, Point, PhysicalBeamElement, PhysicalVertVarSizeElement, PhysicalElementBase, PhysicalTupletBracketElement } from './physical-elements';
import { VertVarSizeGlyphs } from './glyphs';
import { Time } from './../../model/rationals/time';
import { NoteViewModel, TupletViewModel } from './../../logical-view/view-model/note-view-model';
import { NoteRef } from './../../logical-view/view-model/note-view-model';
import { ScoreViewModel } from '../../logical-view';

/*export function findNoteInViewModel(noteRef: NoteRef, viewModel: ScoreViewModel): NoteViewModel | undefined {
    for(let i = 0; i < viewModel.staves.length; i++) {
        const slot = viewModel.staves[i].timeSlots.find(ts => Time.equals(ts.absTime, noteRef.absTime));
        if (!slot) continue;
        const note = slot.notes.find(n => n.uniq === noteRef.uniq);
        if (note) return note;
    }
}*/

export class PhysicalTupletBracket implements PhysicalLongElement {
    constructor(private tvm: TupletViewModel, private settings: Metrics) {}

    private registeredNotes: { [key: string]: PhysicalHorizVarSizeElement } = {};

    testNote(noteRef: NoteRef): boolean {
        const found = this.tvm.noteRefs.find(ref => Time.equals(ref.absTime, noteRef.absTime) && ref.uniq === noteRef.uniq);        
        
        return !!found;
    }

    calcSlope(): number {
        const firstNote = this.getNotestem(0);
        const lastNote = this.getNotestem(this.tvm.noteRefs.length - 1);

        return (lastNote.position.y - firstNote.position.y)/(lastNote.position.x - firstNote.position.x);
    }

    startPoint(): Point {
        const firstNote = this.getNotestem(0);

        return { x: firstNote.position.x, y: firstNote.position.y + firstNote.height };
    }

    addNote(noteRef: NoteRef, notestem: PhysicalHorizVarSizeElement, output: PhysicalElementBase[]): boolean {
        //console.log('adding note');
        if (this.testNote(noteRef)) {
            this.registeredNotes[noteRef.uniq] = notestem;

            //console.log('adding note, testnote ok', noteRef, this.bvm, this.registeredNotes);    
        
            if (Object.keys(this.registeredNotes).length === this.tvm.noteRefs.length) {
                //console.log('beam is full');                
                //console.log('beam is full', noteRef, this.bvm, this.registeredNotes);

                const slope = this.calcSlope();
                const startPoint = this.startPoint();

                this.tvm.tuplets.forEach((tupletBrk) => {
                    let sign = 1;
                    //let firstXPos: number, lastXPos: number;
                    if (tupletBrk.fromIdx === undefined || tupletBrk.toIndex === undefined) { 
                        throw 'Tuplet can not have undefined from and to index';
                    } 
                    
                    const firstNote = this.getNotestem(tupletBrk.fromIdx);
                    sign = Math.sign(firstNote.height);
                    const firstXPos = firstNote.position.x;
                
                    const lastNote = this.getNotestem(tupletBrk.toIndex);
                    sign = Math.sign(lastNote.height);
                    const lastXPos = lastNote.position.x;                
            
                    const length = lastXPos - firstXPos;
                    const height = length * slope;
                    const yStart = (firstXPos - startPoint.x) * slope + startPoint.y;
                    output.push({
                        element: VertVarSizeGlyphs.TupletBracket,
                        position: { x: firstXPos, y: yStart - this.settings.tupletSpacing * sign },
                        length,
                        height,
                        bracketHeight: this.settings.tupletBracketHeight * sign,
                        text: tupletBrk.tuplet
                    } as PhysicalTupletBracketElement);
    
                });

                return true;
            }
        }
        return false;
    }

    getNotestem(idx: number): PhysicalHorizVarSizeElement {
        return this.registeredNotes[this.tvm.noteRefs[idx].uniq];
    }
}