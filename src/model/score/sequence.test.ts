import { Note, NoteDirection } from './../notes/note';
import { Time } from '../rationals/time';
import { SimpleSequence, CompositeSequence } from './sequence';
import { expect } from 'chai';
describe('Sequence', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
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
        const seq1 = SimpleSequence.splitByNotes(seq3Text);
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
                    '_duration': Time.newSpan(1, 4),
                    '_pitches': [
                        {
                            '_accidental': 0,
                            '_octave': 3,
                            '_pitchClass': 0
                        }
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-0'
                }
            ]}
        );


        expect(slots).to.deep.eq([
            { time: Time.newAbsolute(0, 1), states: [], elements: [
                {
                    '_duration': Time.newSpan(1, 4),
                    '_pitches': [
                        {
                            '_accidental': 0,
                            '_octave': 3,
                            '_pitchClass': 0
                        }
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-0'
                }
            ] },
            { time: Time.newAbsolute(1, 4), states: [], elements: [
                {
                    '_duration': Time.newSpan(1, 8),
                    '_pitches': [
                        {
                            '_accidental': 0,
                            '_octave': 3,
                            '_pitchClass': 1
                        }
                    ],
                    'direction': NoteDirection.Undefined,
                    uniq: 'x-1'
                }
            ] },
            { time: Time.newAbsolute(3, 8), states: [], elements: [
                {
                    '_duration': Time.newSpan(1, 8),
                    '_pitches': [
                        {
                            '_accidental': 0,
                            '_octave': 3,
                            '_pitchClass': 2
                        }
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

    describe('CompositeSequence', () => {
        it('should combine the notes of several sequences', () => {
            const seq1 = SimpleSequence.createFromString(seq1Text);
            expect(seq1.duration).to.deep.equal(Time.newSpan(1, 2));
            const seq2 = SimpleSequence.createFromString(seq2Text);
            expect(seq2.duration).to.deep.equal(Time.newSpan(1, 1));

            const seqCombined = new CompositeSequence(seq1, seq2);

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(3, 2));
            expect(seqCombined.elements).to.have.length(7);

            expect(seqCombined.elements[0]).to.deep.equal(Note.parseLily('c4'));
            expect(seqCombined.elements[5]).to.deep.equal(Note.parseLily('e,8'));
        });

        it('should reflect changes in original sequences', () => {
            const seq1 = SimpleSequence.createFromString(seq1Text);
            expect(seq1.duration).to.deep.equal(Time.HalfTime);
            const seq2 = SimpleSequence.createFromString(seq2Text);
            expect(seq2.duration).to.deep.equal(Time.WholeTime);

            const seqCombined = new CompositeSequence(seq1, seq2, seq1);

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(2, 1));
            expect(seqCombined.elements).to.have.length(10);

            expect(seqCombined.elements[0]).to.deep.equal(Note.parseLily('c4'));
            expect(seqCombined.elements[7]).to.deep.equal(Note.parseLily('c4'));

            seq1.elements[0].duration.denominator = 8;

            expect(seqCombined.elements[0]).to.deep.equal(Note.parseLily('c8'));
            expect(seqCombined.elements[7]).to.deep.equal(Note.parseLily('c8'));

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(7, 4));

            seq1.addElement(Note.parseLily('d4'));

            expect(seqCombined.elements).to.have.length(12);

            expect(seqCombined.elements[3]).to.deep.equal(Note.parseLily('d4'));
            expect(seqCombined.elements[11]).to.deep.equal(Note.parseLily('d4'));

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(9, 4));
        });

    });
});