import { BeamDef } from './../../model/notes/beaming';
import { PhysicalLongElement, PhysicalLongElementBase } from './physical-long-element';
import { Metrics } from './metrics';
import { PhysicalHorizVarSizeElement, Point, PhysicalElementBase } from './physical-elements';
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

    return undefined;
}

export class PhysicalBeamGroup extends PhysicalLongElementBase {
    constructor(bvm: BeamingViewModel, settings: Metrics) {
        super(bvm.noteRefs, settings);

        this.beams = bvm.beams;
        this.grace = bvm.grace;
    }

    beams: BeamDef[];
    grace?: boolean;

    calcSlope(): number {
        const firstNote = this.getNotestem(0);
        const lastNote = this.getNotestem(this.noteRefs.length - 1);

        return (lastNote.position.y - firstNote.position.y)/(lastNote.position.x - firstNote.position.x);
    }

    startPoint(): Point {
        const firstNote = this.getNotestem(0);
        const maxLevel = this.beams.reduce((prev, curr) => curr.level > prev ? curr.level : prev, 0);
        const extraHeight = maxLevel > 1 ? (maxLevel - 1) * this.settings.beamSpacing * Math.sign(firstNote.height) : 0;

        return { x: firstNote.position.x, y: firstNote.position.y + firstNote.height + extraHeight };
    }


    finishObject(output: PhysicalElementBase[]): void {
        const slope = this.calcSlope();
        const startPoint = this.startPoint();

        this.noteRefs.forEach(nr => {
            const notestem = this.registeredNotes[nr.uniq];
            notestem.height = startPoint.y + slope * (notestem.position.x - startPoint.x) - notestem.position.y;
        });


        this.beams.forEach((beam, index) => {
            let sign = 1;
            let firstXPos: number, lastXPos: number;
            let fromIdx = beam.fromIdx;
            if (fromIdx === undefined) {
                //console.log('undefined', beam);
                if (beam.toIndex === undefined)
                    throw 'Beam can not have undefined from and to index';
                fromIdx = beam.toIndex - 1;
                const lastNote = this.getNotestem(beam.toIndex);
                firstXPos = lastNote.position.x - this.settings.brokenBeamLength;
            } else {
                //console.log('defined', beam);
                const firstNote = this.getNotestem(fromIdx);
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
            const beamSpacing = this.grace ? this.settings.beamSpacing * this.settings.graceScale : this.settings.beamSpacing;
            const res: PhysicalElementBase = {
                element: VertVarSizeGlyphs.Beam,
                position: { x: firstXPos, y: yStart - beamSpacing * beam.level * sign },
                length,
                height
            };
            if (this.grace) {
                res.scale = this.settings.graceScale;
            }
            output.push(res);

        });
    }

}