import { Pitch } from './../pitches/pitch';
import { createNoteFromLilypond, Note, NoteDirection } from './../notes/note';
import { Time } from '../rationals/time';
import {  } from './sequence';
import { expect } from 'chai';
import { LongDecorationType } from '../decorations/decoration-type';
import { FlexibleSequence } from './flexible-sequence';
import { FuncDef } from './functions';
describe('Functions', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    //const seq4Text = 'c,2 d,8 <e, c>4';


    beforeEach(() => { 
        //
    });


    it('should be possible to use a function in FlexibleSqeuences', () => {
        const seqWithFunction = ['c4', {function: 'Reverse' as FuncDef, args: ['d4 e4 f4']}];

        const seq = new FlexibleSequence(seqWithFunction);

        expect(seq.count).to.eq(4);
        expect(seq.def).to.deep.eq([['c4'], {function: 'Reverse', args: [['d4', 'e4', 'f4']]}]);
        expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
        expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('f4'));
    });


    
    it('should be possible to use different functions in FlexibleSqeuences', () => {
        const seqWithFunction = ['c4', {function: 'Repeat' as FuncDef, args: ['d4 e4 f4']}];

        const seq = new FlexibleSequence(seqWithFunction);

        expect(seq.count).to.eq(7);
        expect(seq.def).to.deep.eq([['c4'], {function: 'Repeat', args: [['d4', 'e4', 'f4']]}]);
        expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
        expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('d4'));
        expect(seq.elements[3]).to.deep.eq(createNoteFromLilypond('f4'));
        expect(seq.elements[4]).to.deep.eq(createNoteFromLilypond('d4'));
    });


});