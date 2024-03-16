import { GraceSequence, RetrogradeSequence, TupletSequence } from './transformations';
import { createNoteFromLilypond } from './../notes/note';
import { Time } from '../rationals/time';
import { SimpleSequence, CompositeSequence, getDuration } from './sequence';
import { expect } from 'chai';
import { TupletState } from '../data-only/notes';
describe('Sequence transformations', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    const seq4Text = 'c,16 d,16 e,16';

    beforeEach(() => { 
        //
    });

    it('should create the retrograde of a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq3Text);
        const retro = new RetrogradeSequence(seq1);
        
        expect(retro.elements.length).to.equal(3);
        expect(retro.duration).to.deep.equal(Time.newSpan(7, 8));
        expect(seq1.elements[0]).to.deep.equal(createNoteFromLilypond('c,2'));
        expect(retro.elements[2]).to.deep.equal(createNoteFromLilypond('c,2'));
        expect(retro.elements[0]).to.deep.equal(createNoteFromLilypond('<e, c>4'));
    });

    it('should create the a tuplet group from a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        const tuplet = new TupletSequence(seq1, { numerator: 2, denominator: 3 });
        
        expect(tuplet.elements.length).to.equal(3);
        expect(tuplet.duration).to.deep.equal(Time.newSpan(1, 3));
        expect(getDuration(seq1.elements[0])).to.deep.equal(Time.newSpan(1, 4));
        expect(getDuration(tuplet.elements[0])).to.deep.equal(Time.newSpan(1, 6));
        expect(getDuration(tuplet.elements[2])).to.deep.equal(Time.newSpan(1, 12));
        
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

    it('should create a grace note group from a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        const graceSeq = new GraceSequence(SimpleSequence.createFromString(seq4Text));        
        
        const slots = graceSeq.groupByTimeSlots('x');
        expect(slots).to.have.length(3);
        expect(slots[0].elements[0], '0-0 first').to.deep.include({
            grace: true
        });
        expect(graceSeq.duration).to.deep.eq(Time.NoTime);
        
        const combiSeq = new CompositeSequence(graceSeq, seq1);
        expect(combiSeq.duration).to.deep.eq(Time.HalfTime);
        const slots1 = combiSeq.groupByTimeSlots('y');
        expect(slots1).to.have.length(6);
        expect(slots1[0].elements[0], '0-0 grace').to.deep.include({
            grace: true
        });
        expect(slots1[1].elements[0], '1-0 grace').to.deep.include({
            grace: true
        });
        expect(slots1[2].elements[0], '2-0 grace').to.deep.include({
            grace: true
        });
        expect(slots1[3].elements[0], '3-0 not grace').to.not.deep.include({
            grace: true
        });

    });


    
    it('should order grace notes correctly in a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        const graceSeq = new GraceSequence(SimpleSequence.createFromString(seq4Text));        
        const combiSeq = new CompositeSequence(graceSeq, seq1);

        const slots1 = combiSeq.groupByTimeSlots('y');
        expect(slots1).to.have.length(6);
        expect(slots1[0].time).to.deep.include({
            extended: -9999
        });
        expect(slots1[1].time).to.deep.include({
            extended: -9998
        });
        expect(slots1[2].time).to.deep.include({
            extended: -9997
        });
        expect(slots1[3].time).to.not.have.property('extended');

    });


});