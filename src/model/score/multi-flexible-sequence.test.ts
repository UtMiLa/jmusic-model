import { Pitch } from './../pitches/pitch';
import { createNoteFromLilypond, Note, setDuration } from './../notes/note';
import { Time } from '../rationals/time';
import { parseLilyClef } from './sequence';
import { expect } from 'chai';
import { FlexibleSequence } from './flexible-sequence';
import { createRepo, VariableRepository } from './variables';
import { MultiFlexibleSequence } from './multi-flexible-sequence';
import { SplitSequenceDef } from '..';
describe('Multi-Flexible Sequence', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    const multiObj1 = { type: 'multi', sequences: ['c4 d8 d8', 'e8 e8 f4'] } as SplitSequenceDef;
    //const seq4Text = 'c,2 d,8 <e, c>4';


    beforeEach(() => { 
        //
    });

    /*it('should accept an empty array', () => {
        const seq = new MultiFlexibleSequence([]);

        expect(seq.seqs).to.deep.eq([]);
        //expect(seq.def).to.deep.eq([]);
    });*/

    it('should accept a lilypond string', () => {
        const seq = new MultiFlexibleSequence(seq1Text);

        expect(seq.seqs.length).to.eq(1);
        expect(seq.seqs[0].elements.length).to.eq(3);
        expect(seq.seqs[0].duration).to.deep.eq(Time.HalfTime);
    });

    it('should accept a multi-sequence object', () => {
        const seq = new MultiFlexibleSequence(multiObj1);

        expect(seq.seqs.length).to.eq(2);
        expect(seq.seqs[0].elements.length).to.eq(3);
        expect(seq.seqs[1].elements.length).to.eq(3);
        expect(seq.seqs[0].duration).to.deep.eq(Time.HalfTime);
    });

    it('should accept an array with a multi-sequence object', () => {
        const seq = new MultiFlexibleSequence([multiObj1]);

        expect(seq.seqs.length).to.eq(2);
        expect(seq.seqs[0].elements.length).to.eq(3);
        expect(seq.seqs[1].elements.length).to.eq(3);
        expect(seq.seqs[0].duration).to.deep.eq(Time.HalfTime);
    });

    
    it('should accept an array with a multi-sequence and a single-sequence object', () => {
        const seq = new MultiFlexibleSequence(['g4 a4', multiObj1]);

        expect(seq.seqs.length).to.eq(2);
        expect(seq.seqs[0].elements.length).to.eq(5);
        expect(seq.seqs[1].elements.length).to.eq(4);
        expect(seq.seqs[0].duration).to.deep.eq(Time.WholeTime);
        expect(seq.seqs[1].duration).to.deep.eq(Time.WholeTime);
    });

});