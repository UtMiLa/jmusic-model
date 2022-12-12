import { PhysicalLongElement, PhysicalLongElementBase } from './physical-long-element';
import { Metrics } from './metrics';
import { PhysicalHorizVarSizeElement, Point, PhysicalBeamElement, PhysicalVertVarSizeElement, PhysicalElementBase, PhysicalTupletBracketElement } from './physical-elements';
import { VertVarSizeGlyphs } from './glyphs';
import { Time } from './../../model/rationals/time';
import { NoteViewModel, TupletViewModel, TupletDef } from './../../logical-view/view-model/note-view-model';
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

export class PhysicalTupletBracket extends PhysicalLongElementBase {
    constructor(tvm: TupletViewModel, settings: Metrics) {
        super(tvm.noteRefs, settings);
        this.tuplets = tvm.tuplets;
    }

    tuplets: TupletDef[]

    calcSlope(): number {
        const firstNote = this.getNotestem(0);
        const lastNote = this.getNotestem(this.noteRefs.length - 1);

        return (lastNote.position.y - firstNote.position.y)/(lastNote.position.x - firstNote.position.x);
    }

    startPoint(): Point {
        const firstNote = this.getNotestem(0);

        return { x: firstNote.position.x, y: firstNote.position.y + firstNote.height };
    }


    finishObject(output: PhysicalElementBase[]): void {
        const slope = this.calcSlope();
        const startPoint = this.startPoint();

        this.tuplets.forEach((tupletBrk) => {
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
    }

}