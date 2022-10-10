import { NoteDirection } from './../notes/note';
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

    it('should calculate the time slots of a sequence', () => {
        const seq1 = Sequence.createFromString(seq1Text);
        
        expect(seq1.getTimeSlots()).to.deep.equal([
            Time.newAbsolute(0, 1),
            Time.newAbsolute(1, 4),
            Time.newAbsolute(3, 8)
        ]);

        expect(seq1.groupByTimeSlots()).to.deep.equal([
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
                    'direction': NoteDirection.Undefined
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
                    'direction': NoteDirection.Undefined
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
                    'direction': NoteDirection.Undefined
                }

            ] }
        ]);
        
        const seq2 = Sequence.createFromString(seq2Text);
        expect(seq2.getTimeSlots()).to.deep.equal([
            Time.newAbsolute(0, 1),
            Time.newAbsolute(1, 2),
            Time.newAbsolute(5, 8),
            Time.newAbsolute(3, 4)
        ]);
    });
});