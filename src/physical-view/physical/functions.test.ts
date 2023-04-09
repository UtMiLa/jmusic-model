import { StandardMetrics } from './../../physical-view';
import { expect } from 'chai';
import { NoteDirection, NoteType } from '../../model';
import { NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { calcDisplacements, scaleDegreeToY, staffLineToY, yToScaleDegree, yToStaffLine } from './functions';
describe('Physical help functions', () => {

    it('should correctly displace note heads in dense chords', () => {
        const noteView: NoteViewModel = { positions: [1, 2, 3, 4, 6, 7, 9, 10], direction: NoteDirection.Up, noteType: NoteType.NQuarter, uniq: '1' };

        const res1 = calcDisplacements(noteView);

        expect(res1).to.deep.equal([0, 1, 0, 1, 0, 1, 0, 1]);

        noteView.direction = NoteDirection.Down;

        const res2 = calcDisplacements(noteView);

        expect(res2).to.deep.equal([-1, 0, -1, 0, -1, 0, -1, 0]);

        const noteView2: NoteViewModel = { positions: [1, 2, 3, 4, 6, 8, 10], direction: NoteDirection.Up, noteType: NoteType.NQuarter, uniq: '2' };

        const res3 = calcDisplacements(noteView2);

        expect(res3).to.deep.equal([0, 1, 0, 1, 0, 0, 0]);

        noteView2.direction = NoteDirection.Down;

        const res4 = calcDisplacements(noteView2);

        expect(res4).to.deep.equal([ -1, 0, -1, 0, 0, 0, 0]);

    });


    it('should convert staff lines to positions', () => {
        const settings = new StandardMetrics();

        expect(staffLineToY(0, settings)).to.eq(12);
        expect(staffLineToY(1, settings)).to.eq(18);
        expect(staffLineToY(6, settings)).to.eq(48);

        expect(yToStaffLine(48, settings)).to.eq(6);
        expect(yToStaffLine(18, settings)).to.eq(1);
        expect(yToStaffLine(12, settings)).to.eq(0);
        expect(yToStaffLine(6, settings)).to.eq(-1);

        expect(scaleDegreeToY(0, settings)).to.eq(12);
        expect(scaleDegreeToY(2, settings)).to.eq(18);
        expect(scaleDegreeToY(12, settings)).to.eq(48);

        expect(yToScaleDegree(48, settings)).to.eq(12);
        expect(yToScaleDegree(18, settings)).to.eq(2);
        expect(yToScaleDegree(12, settings)).to.eq(0);
        expect(yToScaleDegree(6, settings)).to.eq(-2);

    });
});