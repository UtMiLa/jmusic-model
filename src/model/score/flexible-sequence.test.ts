import { Pitch } from './../pitches/pitch';
import { createNoteFromLilypond, Note, NoteDirection } from './../notes/note';
import { Time } from '../rationals/time';
import {  } from './sequence';
import { expect } from 'chai';
import { LongDecorationType } from '../decorations/decoration-type';
import { FlexibleSequence } from './flexible-sequence';
describe('Sequence', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    //const seq4Text = 'c,2 d,8 <e, c>4';


    beforeEach(() => { 
        //
    });

    it('should accept an empty array', () => {
        const seq = new FlexibleSequence([]);

        expect(seq.count).to.eq(0);
        expect(seq.def).to.deep.eq([]);
    });

    it('should accept a lilypond string', () => {
        const seq = new FlexibleSequence(seq1Text);

        expect(seq.count).to.eq(3);
        expect(seq.def).to.deep.eq(['c4', 'd8', 'e8']);
    });

    it('should accept an array with lilypond strings', () => {
        const seq = new FlexibleSequence([seq1Text, seq2Text]);

        expect(seq.count).to.eq(7);
        expect(seq.def).to.deep.eq([['c4', 'd8', 'e8'], ['c,2', 'd,8', 'e,8', 'c4']]);

        
        const seq2 = new FlexibleSequence([seq1Text, [seq3Text, seq2Text]]);

        expect(seq2.count).to.eq(10);
        expect(seq2.def).to.deep.eq([['c4', 'd8', 'e8'], [['c,2', 'd,8', '<e, c>4'], ['c,2', 'd,8', 'e,8', 'c4']]]);
    });


    it('should calculate the length of a sequence', () => {
        const seq1 = new FlexibleSequence(seq1Text);
        expect(seq1.duration).to.deep.equal(Time.HalfTime);
        const seq2 = new FlexibleSequence([seq2Text]);
        expect(seq2.duration).to.deep.equal(Time.WholeTime);
        const seq3 = new FlexibleSequence([seq1Text, seq2Text, seq3Text]);
        expect(seq3.duration).to.deep.equal(Time.newSpan(19, 8));
    });


    it('should calculate the time slots of a sequence', () => {
        const seq1 = new FlexibleSequence([seq1Text]);
        
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
                    'duration': Time.newSpan(1, 4),
                    'nominalDuration': Time.newSpan(1, 4),
                    'dotNo': 0,
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
                    'duration': Time.newSpan(1, 4),
                    'nominalDuration': Time.newSpan(1, 4),
                    'dotNo': 0,
                    'pitches': [
                        new Pitch(0, 3, 0)
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-0'
                }
            ] },
            { time: Time.newAbsolute(1, 4), states: [], elements: [
                {
                    'duration': Time.newSpan(1, 8),
                    'nominalDuration': Time.newSpan(1, 8),
                    'dotNo': 0,
                    'pitches': [
                        new Pitch(1, 3, 0)
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-1'
                }
            ] },
            { time: Time.newAbsolute(3, 8), states: [], elements: [
                {
                    'duration': Time.newSpan(1, 8),
                    'nominalDuration': Time.newSpan(1, 8),
                    'dotNo': 0,
                    'pitches': [
                        new Pitch(2, 3, 0)
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-2'
                }

            ] }
        ]);        
        
        const seq2 = new FlexibleSequence(seq2Text);
        expect(seq2.getTimeSlots()).to.deep.equal([
            Time.newAbsolute(0, 1),
            Time.newAbsolute(1, 2),
            Time.newAbsolute(5, 8),
            Time.newAbsolute(3, 4)
        ]);
    });


    it('should assign bars and state changes to an earlier time slot than the note', () => {
        const seq1 = new FlexibleSequence(seq1Text);
        
        expect(seq1.getTimeSlots()).to.deep.equal([
            Time.newAbsolute(0, 1),
            Time.newAbsolute(1, 4),
            Time.newAbsolute(3, 8)
        ]);

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

    });


    /*it('should assign decorations to the time slots of a sequence', () => {
        const seq1 = new FlexibleSequence(seq1Text);
        
        seq1.insertElement(Time.newAbsolute(1, 4), { longDeco: LongDecorationType.Decrescendo, length: Time.QuarterTime, duration: Time.NoTime });

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

        expect(slots[1]).to.deep.include(
            { time: Time.newAbsolute(1, 4), states: [], decorations: [
                { longDeco: LongDecorationType.Decrescendo, length: Time.QuarterTime, duration: Time.NoTime }
            ]}
        );
    });

    /*it('should assign slurs to the time slots of a sequence', () => {
        const seq1 = new FlexibleSequence(seq1Text);
        
        seq1.insertElement(Time.newAbsolute(1, 4), { longDeco: LongDecorationType.Slur, length: Time.QuarterTime, duration: Time.NoTime });

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

        expect(slots[1]).to.deep.include(
            { time: Time.newAbsolute(1, 4), states: [], decorations: [
                { longDeco: LongDecorationType.Slur, length: Time.QuarterTime, duration: Time.NoTime }
            ]}
        );
    });*/

    describe('Composite FlexibleSequence', () => {
        it('should combine the notes of several sequences', () => {
            const seqCombined = new FlexibleSequence([seq1Text, seq2Text]);

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(3, 2));
            expect(seqCombined.elements).to.have.length(7);

            expect(seqCombined.elements[0]).to.deep.equal(createNoteFromLilypond('c4'));
            expect(seqCombined.elements[5]).to.deep.equal(createNoteFromLilypond('e,8'));
        });

        /*it('should reflect changes in original sequences', () => {
            const seqCombined = new FlexibleSequence([seq1Text, seq2Text, seq1Text]);

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(2, 1));
            expect(seqCombined.elements).to.have.length(10);

            expect(seqCombined.elements[0]).to.deep.equal(createNoteFromLilypond('c4'));
            expect(seqCombined.elements[7]).to.deep.equal(createNoteFromLilypond('c4'));

            seq1.elements[0] = cloneNote(seq1.elements[0] as Note, { nominalDuration: { ...seq1.elements[0].duration, denominator: 8 }} as any);

            expect(seqCombined.elements[0]).to.deep.equal(createNoteFromLilypond('c8'));
            expect(seqCombined.elements[7]).to.deep.equal(createNoteFromLilypond('c8'));

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(7, 4));

            seq1.addElement(createNoteFromLilypond('d4'));

            expect(seqCombined.elements).to.have.length(12);

            expect(seqCombined.elements[3]).to.deep.equal(createNoteFromLilypond('d4'));
            expect(seqCombined.elements[11]).to.deep.equal(createNoteFromLilypond('d4'));

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(9, 4));
        });*/

    });
});