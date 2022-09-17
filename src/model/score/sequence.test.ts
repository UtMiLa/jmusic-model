import { Time } from '../rationals/time';
import { Sequence } from './sequence';
import { expect } from 'chai';
describe('Sequence', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    beforeEach(() => { 
        //
    });

    it('should accept an empty sequence', () => {
        const seq1 = Sequence.createFromString('');
        expect(seq1.count).to.equal(0);
    });

    it('should parse a sequence', () => {
        const seq1 = Sequence.createFromString(seq1Text);
        expect(seq1.count).to.equal(3);

        const seq2 = Sequence.createFromString(seq2Text);
        expect(seq2.count).to.equal(4);
    });

    it('should parse a sequence with chords', () => {
        const seq1 = Sequence.createFromString(seq3Text);
        expect(seq1.count).to.equal(3);
    });

    it('should parse chords in chunks', () => {
        const seq1 = Sequence.splitByNotes(seq3Text);
        expect(seq1).to.deep.equal(['c,2', 'd,8', '<e, c>4']);
    });

    it('should calculate the length of a sequence', () => {
        const seq1 = Sequence.createFromString(seq1Text);
        expect(seq1.duration).to.deep.equal(Time.newSpan(1, 2));
        const seq2 = Sequence.createFromString(seq2Text);
        expect(seq2.duration).to.deep.equal(Time.newSpan(1, 1));
    });
});