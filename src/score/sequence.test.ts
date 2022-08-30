import { Time } from './../rationals/time';
import { Sequence } from './sequence';
import { expect } from 'chai';
describe('Pitch', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    beforeEach(() => { 
        //
    });

    it('should parse a sequence', () => {
        const seq1 = Sequence.createFromString(seq1Text);
        expect(seq1.count).to.equal(3);

        const seq2 = Sequence.createFromString(seq2Text);
        expect(seq2.count).to.equal(4);
    });


    it('should calculate the length of a sequence', () => {
        const seq1 = Sequence.createFromString(seq1Text);
        expect(seq1.duration).to.deep.equal(Time.newSpan(1, 2));
        const seq2 = Sequence.createFromString(seq2Text);
        expect(seq2.duration).to.deep.equal(Time.newSpan(1, 1));
    });
});