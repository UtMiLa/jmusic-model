import { LongDecorationType } from './../data-only/decorations';
import { NoteDirection } from './../data-only/notes';
import { Pitch } from './../pitches/pitch';
import { createNoteFromLilypond, Note, setDuration } from './../notes/note';
import { Time } from '../rationals/time';
import { SimpleSequence, CompositeSequence, getDuration, BaseSequence, ISequence, splitByNotes } from './sequence';
import { expect } from 'chai';
import { SinonSpy } from 'sinon';
import Sinon = require('sinon');
import { MeterFactory } from '../states/meter';
import { StateChange } from '../states/state';
import { Clef } from '../states/clef';
import { Key } from '../states/key';
describe('Sequence', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    //const seq4Text = 'c,2 d,8 <e, c>4';


    beforeEach(() => { 
        //
    });

    it('should accept an empty sequence', () => {
        const seq1 = SimpleSequence.createFromString('');
        expect(seq1.count).to.equal(0);
    });

    it('should parse a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        expect(seq1.count).to.equal(3);

        const seq2 = SimpleSequence.createFromString(seq2Text);
        expect(seq2.count).to.equal(4);
    });

    it('should parse a sequence with chords', () => {
        const seq1 = SimpleSequence.createFromString(seq3Text);
        expect(seq1.count).to.equal(3);
    });

    it('should parse chords in chunks', () => {
        const seq1 = splitByNotes(seq3Text);
        expect(seq1).to.deep.equal(['c,2', 'd,8', '<e, c>4']);
    });

    it('should calculate the length of a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        expect(seq1.duration).to.deep.equal(Time.HalfTime);
        const seq2 = SimpleSequence.createFromString(seq2Text);
        expect(seq2.duration).to.deep.equal(Time.WholeTime);
    });

    it('should calculate the time slots of a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        
        expect(seq1.getTimeSlots()).to.deep.equal([
            Time.newAbsolute(0, 1),
            Time.newAbsolute(1, 4),
            Time.newAbsolute(3, 8)
        ]);

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

        expect(slots[0]).to.deep.include(
            { time: Time.newAbsolute(0, 1), states: [], elements: [
                {
                    'nominalDuration': Time.newSpan(1, 4),
                    'pitches': [
                        new Pitch(0, 3, 0)
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-0'
                }
            ]}
        );


        expect(slots).to.deep.eq([
            { time: Time.newAbsolute(0, 1), states: [], elements: [
                {
                    'nominalDuration': Time.newSpan(1, 4),
                    'pitches': [
                        new Pitch(0, 3, 0)
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-0'
                }
            ] },
            { time: Time.newAbsolute(1, 4), states: [], elements: [
                {
                    'nominalDuration': Time.newSpan(1, 8),
                    'pitches': [
                        new Pitch(1, 3, 0)
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-1'
                }
            ] },
            { time: Time.newAbsolute(3, 8), states: [], elements: [
                {
                    'nominalDuration': Time.newSpan(1, 8),
                    'pitches': [
                        new Pitch(2, 3, 0)
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-2'
                }

            ] }
        ]);        
        
        const seq2 = SimpleSequence.createFromString(seq2Text);
        expect(seq2.getTimeSlots()).to.deep.equal([
            Time.newAbsolute(0, 1),
            Time.newAbsolute(1, 2),
            Time.newAbsolute(5, 8),
            Time.newAbsolute(3, 4)
        ]);
    });


    /*it('should assign bars and state changes to an earlier time slot than the note', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        
        expect(seq1.getTimeSlots()).to.deep.equal([
            Time.newAbsolute(0, 1),
            Time.newAbsolute(1, 4),
            Time.newAbsolute(3, 8)
        ]);

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

    });*/


    it('should assign decorations to the time slots of a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        
        seq1.insertElement(Time.newAbsolute(1, 4), { longDeco: LongDecorationType.Decrescendo, length: Time.QuarterTime });

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

        expect(slots[1]).to.deep.include(
            { time: Time.newAbsolute(1, 4), states: [], decorations: [
                { longDeco: LongDecorationType.Decrescendo, length: Time.QuarterTime }
            ]}
        );
    });

    it('should assign slurs to the time slots of a sequence', () => {
        const seq1 = SimpleSequence.createFromString(seq1Text);
        
        seq1.insertElement(Time.newAbsolute(1, 4), { longDeco: LongDecorationType.Slur, length: Time.QuarterTime });

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

        expect(slots[1]).to.deep.include(
            { time: Time.newAbsolute(1, 4), states: [], decorations: [
                { longDeco: LongDecorationType.Slur, length: Time.QuarterTime }
            ]}
        );
    });

    describe('CompositeSequence', () => {
        it('should combine the notes of several sequences', () => {
            const seq1 = SimpleSequence.createFromString(seq1Text);
            expect(seq1.duration).to.deep.equal(Time.newSpan(1, 2));
            const seq2 = SimpleSequence.createFromString(seq2Text);
            expect(seq2.duration).to.deep.equal(Time.newSpan(1, 1));

            const seqCombined = new CompositeSequence(seq1, seq2);

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(3, 2));
            expect(seqCombined.elements).to.have.length(7);

            expect(seqCombined.elements[0]).to.deep.equal(createNoteFromLilypond('c4'));
            expect(seqCombined.elements[5]).to.deep.equal(createNoteFromLilypond('e,8'));
        });

        it('should reflect changes in original sequences', () => {
            const seq1 = SimpleSequence.createFromString(seq1Text);
            expect(seq1.duration).to.deep.equal(Time.HalfTime);
            const seq2 = SimpleSequence.createFromString(seq2Text);
            expect(seq2.duration).to.deep.equal(Time.WholeTime);

            const seqCombined = new CompositeSequence(seq1, seq2, seq1);

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(2, 1));
            expect(seqCombined.elements).to.have.length(10);

            expect(seqCombined.elements[0]).to.deep.equal(createNoteFromLilypond('c4'));
            expect(seqCombined.elements[7]).to.deep.equal(createNoteFromLilypond('c4'));

            seq1.elements[0] = setDuration(seq1.elements[0] as Note, { ...getDuration(seq1.elements[0]), denominator: 8 });

            expect(seqCombined.elements[0]).to.deep.equal(createNoteFromLilypond('c8'));
            expect(seqCombined.elements[7]).to.deep.equal(createNoteFromLilypond('c8'));

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(7, 4));

            seq1.addElement(createNoteFromLilypond('d4'));

            expect(seqCombined.elements).to.have.length(12);

            expect(seqCombined.elements[3]).to.deep.equal(createNoteFromLilypond('d4'));
            expect(seqCombined.elements[11]).to.deep.equal(createNoteFromLilypond('d4'));

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(9, 4));
        });

    });

    describe('Map and filter', () => {
        let seq: ISequence;
        let spy: SinonSpy;

        beforeEach(() => {
            seq = new SimpleSequence('c4 d8. e16 f4 \\meter 5/8 \\key g \\major g4 \\clef bass a4.');
            spy = Sinon.spy();
        });
        it ('should map elements together with times', () => {
            seq.chainElements(spy);
            
            /*Sinon.assert.callCount(spy, 9);
            Sinon.assert.calledWith(spy, createNoteFromLilypond('c4'), Time.StartTime);
            Sinon.assert.calledWith(spy, createNoteFromLilypond('g4'), Time.newAbsolute(3, 4));
            const stateChg = StateChange.newMeterChange(MeterFactory.createRegularMeter({ count: 5, value: 8 }));
            Sinon.assert.calledWith(spy, stateChg, Time.newAbsolute(3, 4));*/
        });
        it ('should filter elements together with times', () => {
            seq.filterElements(spy);
            
            Sinon.assert.callCount(spy, 9);
            Sinon.assert.calledWith(spy, createNoteFromLilypond('c4'), Time.StartTime);
            Sinon.assert.calledWith(spy, createNoteFromLilypond('g4'), Time.newAbsolute(3, 4));
            const stateChg = StateChange.newMeterChange(MeterFactory.createRegularMeter({ count: 5, value: 8 }));
            Sinon.assert.calledWith(spy, stateChg, Time.newAbsolute(3, 4));
        });

        it ('should map elements together with state info', () => {
            const initState = { clef: Clef.clefTreble, meter: MeterFactory.createRegularMeter({ count: 3, value: 4 }), key: new Key({ accidental: -1, count: 3 }) };
            seq.chainElements(spy, initState);
            
            Sinon.assert.callCount(spy, 9);
            Sinon.assert.calledWith(spy, 
                createNoteFromLilypond('c4'), 
                Time.StartTime, 
                initState
            );
            Sinon.assert.calledWith(spy, 
                createNoteFromLilypond('g4'), 
                Time.newAbsolute(3, 4), 
                { clef: Clef.clefTreble, meter: MeterFactory.createRegularMeter({ count: 5, value: 8 }), key: new Key({ accidental: 1, count: 1 }) }
            );
            Sinon.assert.calledWith(spy, 
                StateChange.newMeterChange(MeterFactory.createRegularMeter({ count: 5, value: 8 })), 
                Time.newAbsolute(3, 4),
                { clef: Clef.clefTreble, meter: MeterFactory.createRegularMeter({ count: 3, value: 4 }), key: new Key({ accidental: -1, count: 3 }) }
            );

            Sinon.assert.calledWith(spy, 
                createNoteFromLilypond('a4.'), 
                Time.newAbsolute(1, 1),
                { clef: Clef.clefBass, meter: MeterFactory.createRegularMeter({ count: 5, value: 8 }), key: new Key({ accidental: 1, count: 1 }) }
            );

        });

        it ('should filter elements together with state info', () => {
            const initState = { clef: Clef.clefTreble, meter: MeterFactory.createRegularMeter({ count: 3, value: 4 }), key: new Key({ accidental: -1, count: 3 }) };
            seq.filterElements(spy, initState);
            
            Sinon.assert.callCount(spy, 9);
            Sinon.assert.calledWith(spy, 
                createNoteFromLilypond('c4'), 
                Time.StartTime, 
                initState
            );
            Sinon.assert.calledWith(spy, 
                createNoteFromLilypond('g4'), 
                Time.newAbsolute(3, 4), 
                { clef: Clef.clefTreble, meter: MeterFactory.createRegularMeter({ count: 5, value: 8 }), key: new Key({ accidental: 1, count: 1 }) }
            );
            Sinon.assert.calledWith(spy, 
                StateChange.newMeterChange(MeterFactory.createRegularMeter({ count: 5, value: 8 })), 
                Time.newAbsolute(3, 4),
                { clef: Clef.clefTreble, meter: MeterFactory.createRegularMeter({ count: 3, value: 4 }), key: new Key({ accidental: -1, count: 3 }) }
            );

            Sinon.assert.calledWith(spy, 
                createNoteFromLilypond('a4.'), 
                Time.newAbsolute(1, 1),
                { clef: Clef.clefBass, meter: MeterFactory.createRegularMeter({ count: 5, value: 8 }), key: new Key({ accidental: 1, count: 1 }) }
            );

        });

    });
});