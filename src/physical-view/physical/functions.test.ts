import { expect } from 'chai';
import { NoteDirection, NoteType } from '~/model';
import { NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { calcDisplacements } from './functions';
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
});