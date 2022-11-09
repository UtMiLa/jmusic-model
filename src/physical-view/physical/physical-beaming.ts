import { Metrics } from './metrics';
import { PhysicalHorizVarSizeElement, Point, PhysicalBeamElement, PhysicalVertVarSizeElement, PhysicalElementBase } from './physical-elements';
import { VertVarSizeGlyphs } from './glyphs';
import { Time } from './../../model/rationals/time';
import { NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { BeamingViewModel, NoteRef } from './../../logical-view/view-model/note-view-model';
import { ScoreViewModel } from '../../logical-view';

export function findNoteInViewModel(noteRef: NoteRef, viewModel: ScoreViewModel): NoteViewModel | undefined {
    for(let i = 0; i < viewModel.staves.length; i++) {
        const slot = viewModel.staves[i].timeSlots.find(ts => Time.equals(ts.absTime, noteRef.absTime));
        if (!slot) continue;
        const note = slot.notes.find(n => n.uniq === noteRef.uniq);
        if (note) return note;
    }

    /*const f = viewModel.staves[noteRef.staff].timeSlots.find(ts => Time.equals(ts.absTime, noteRef.absTime));
    
    return f ? f.notes[noteRef.voice] : undefined;*/
    return undefined;
}

export class PhysicalBeamGroup {
    constructor(private bvm: BeamingViewModel, private settings: Metrics) {}

    private registeredNotes: { [key: string]: PhysicalHorizVarSizeElement } = {};

    testNote(noteRef: NoteRef): boolean {
        const found = this.bvm.noteRefs.find(ref => Time.equals(ref.absTime, noteRef.absTime) && ref.uniq === noteRef.uniq);
        //console.log('testing', noteRef, this.bvm, this.registeredNotes);
        
        return !!found;
    }

    calcSlope(): number {
        const firstNote = this.getNotestem(0);
        const lastNote = this.getNotestem(this.bvm.noteRefs.length - 1);

        return (lastNote.position.y - firstNote.position.y)/(lastNote.position.x - firstNote.position.x);
    }

    startPoint(): Point {
        const firstNote = this.getNotestem(0);
        const maxLevel = this.bvm.beams.reduce((prev, curr) => curr.level > prev ? curr.level : prev, 0);
        const extraHeight = maxLevel > 1 ? (maxLevel - 1) * this.settings.beamSpacing * Math.sign(firstNote.height) : 0;

        return { x: firstNote.position.x, y: firstNote.position.y + firstNote.height + extraHeight };
    }

    addNote(noteRef: NoteRef, notestem: PhysicalHorizVarSizeElement, output: PhysicalElementBase[]): boolean {
        //console.log('adding note');
        if (this.testNote(noteRef)) {
            this.registeredNotes[noteRef.uniq] = notestem;

            //console.log('adding note, testnote ok', noteRef, this.bvm, this.registeredNotes);    
        
            if (Object.keys(this.registeredNotes).length === this.bvm.noteRefs.length) {
                //console.log('beam is full');                
                //console.log('beam is full', noteRef, this.bvm, this.registeredNotes);

                const slope = this.calcSlope();
                const startPoint = this.startPoint();

                this.bvm.noteRefs.forEach(nr => {
                    const notestem = this.registeredNotes[nr.uniq];
                    notestem.height = startPoint.y + slope * (notestem.position.x - startPoint.x) - notestem.position.y;
                });
                

                this.bvm.beams.forEach((beam, index) => {
                    let sign = 1;
                    let firstXPos: number, lastXPos: number;
                    if (beam.fromIdx === undefined) { 
                        if (beam.toIndex === undefined) throw 'Beam can not have undefined from and to index';
                        beam.fromIdx = beam.toIndex - 1;
                        const lastNote = this.getNotestem(beam.toIndex);
                        firstXPos = lastNote.position.x - this.settings.brokenBeamLength;
                    } else {
                        const firstNote = this.getNotestem(beam.fromIdx);
                        sign = Math.sign(firstNote.height);
                        firstXPos = firstNote.position.x;
                    }
                    
                    if (beam.toIndex === undefined) {
                        lastXPos = firstXPos + this.settings.brokenBeamLength;
                    } else {
                        const lastNote = this.getNotestem(beam.toIndex);
                        sign = Math.sign(lastNote.height);
                        lastXPos = lastNote.position.x;
                    }
               
                    const length = lastXPos - firstXPos;
                    const height = length * slope;
                    const yStart = (firstXPos - startPoint.x) * slope + startPoint.y;
                    output.push({
                        element: VertVarSizeGlyphs.Beam,
                        position: { x: firstXPos, y: yStart - this.settings.beamSpacing * beam.level * sign },
                        length,
                        height
                    });
    
                });

                return true;
            }
        }
        return false;
    }

    getNotestem(idx: number): PhysicalHorizVarSizeElement {
        return this.registeredNotes[this.bvm.noteRefs[idx].uniq];
    }
}