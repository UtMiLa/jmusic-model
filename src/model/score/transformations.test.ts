import { RetrogradeSequence, TupletSequence } from './transformations';
import { Note, NoteDirection, TupletState } from './../notes/note';
import { Time } from '../rationals/time';
import { SimpleSequence, CompositeSequence } from './sequence';
import { expect } from 'chai';
describe('Sequence transformations', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    beforeEach(() => { 
        //
    });

    it('should create the retrograde of a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq3Text);
        const retro = new RetrogradeSequence(seq1);
        
        expect(retro.elements.length).to.equal(3);
        expect(retro.duration).to.deep.equal(Time.newSpan(7, 8));
        expect(seq1.elements[0]).to.deep.equal(Note.parseLily('c,2'));
        expect(retro.elements[2]).to.deep.equal(Note.parseLily('c,2'));
        expect(retro.elements[0]).to.deep.equal(Note.parseLily('<e, c>4'));
    });

    it('should create the a tuplet group from a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        const tuplet = new TupletSequence(seq1, { numerator: 2, denominator: 3 });
        
        expect(tuplet.elements.length).to.equal(3);
        expect(tuplet.duration).to.deep.equal(Time.newSpan(1, 3));
        expect(seq1.elements[0].duration).to.deep.equal(Time.newSpan(1, 4));
        expect(tuplet.elements[0].duration).to.deep.equal(Time.newSpan(1, 6));
        expect(tuplet.elements[2].duration).to.deep.equal(Time.newSpan(1, 12));
        
    });

    it('should create a tuplet group from a tuplet sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        const tuplet = new TupletSequence(seq1, { numerator: 2, denominator: 3 });
        
        const slots = tuplet.groupByTimeSlots('x');
        expect(slots).to.have.length(3);
        expect(slots[0].elements[0]).to.deep.include({
            tupletGroup: TupletState.Begin
        });
        expect(slots[1].elements[0]).to.deep.include({
            tupletGroup: TupletState.Inside
        });
        expect(slots[2].elements[0]).to.deep.include({
            tupletGroup: TupletState.End
        });
    });

    it('should create a tuplet group from a reversed tuplet sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        const tuplet = new TupletSequence(seq1, { numerator: 2, denominator: 3 });
        const tuplet1 = new RetrogradeSequence(tuplet);
        
        const slots = tuplet1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);
        expect(slots[0].elements[0]).to.deep.include({
            tupletGroup: TupletState.Begin
        });
        expect(slots[1].elements[0]).to.deep.include({
            tupletGroup: TupletState.Inside
        });
        expect(slots[2].elements[0]).to.deep.include({
            tupletGroup: TupletState.End
        });
    });


});