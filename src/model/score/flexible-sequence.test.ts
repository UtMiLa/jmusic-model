import { Pitch } from './../pitches/pitch';
import { createNoteFromLilypond, Note, NoteDirection, setDuration } from './../notes/note';
import { Time } from '../rationals/time';
import { parseLilyClef } from './sequence';
import { expect } from 'chai';
import { LongDecorationType } from '../decorations/decoration-type';
import { FlexibleSequence } from './flexible-sequence';
import { createRepo, VariableRepository } from './variables';
describe('Flexible Sequence', () => {
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

    it('should simplify the depth of arrays in sequence definition', () => {
        const seq2 = new FlexibleSequence([seq1Text.split(' '), [seq3Text, seq2Text.split(' ')]]);

        expect(seq2.def).to.deep.eq([['c4', 'd8', 'e8'], [['c,2', 'd,8', '<e, c>4'], ['c,2', 'd,8', 'e,8', 'c4']]]);
    });

    /*it('should calculate an internal structure including correct times', () => {
        const seq2 = new FlexibleSequence([seq1Text.split(' '), [seq3Text, seq2Text.split(' ')]]);

        expect(seq2.def).to.deep.eq([['c4', 'd8', 'e8'], [['c,2', 'd,8', '<e, c>4'], ['c,2', 'd,8', 'e,8', 'c4']]]);
        expect(seq2.internalElements).to.have.length(10);
        expect(seq2.internalElements[0].time).to.eq(Time.StartTime);
        expect(seq2.internalElements[1].time).to.deep.eq(Time.newAbsolute(1, 4));
        expect(seq2.internalElements[2].time).to.deep.eq(Time.newAbsolute(3, 8));
        expect(seq2.internalElements[3].time).to.deep.eq(Time.newAbsolute(1, 2));
        expect(seq2.internalElements[5].time).to.deep.eq(Time.newAbsolute(9, 8));
        expect(seq2.internalElements[6].time).to.deep.eq(Time.newAbsolute(11, 8));
        expect(seq2.internalElements[7].time).to.deep.eq(Time.newAbsolute(15, 8));
    });*/

    it('should accept a MusicEvent object', () => {
        const clefChg = { 
            clef: parseLilyClef('treble'), 
            isState: true
        };
        const seq = new FlexibleSequence(['c4', clefChg, 'e8']);

        expect(seq.count).to.eq(3);
        expect(seq.def).to.deep.eq(['c4', clefChg, 'e8']);
    });


    it('should map an element index to a path', () => {
        const seq1 = new FlexibleSequence(seq1Text);

        expect(seq1.indexToPath(0)).to.deep.eq([0, 0]);
        expect(seq1.indexToPath(2)).to.deep.eq([2, 0]);
        expect(() => seq1.indexToPath(3)).to.throw();

        const seq2 = new FlexibleSequence([seq1Text, [seq3Text, seq2Text]]);

        expect(seq2.indexToPath(0)).to.deep.eq([0, 0, 0]);
        expect(seq2.indexToPath(3)).to.deep.eq([1, 0, 0, 0]);
        expect(seq2.indexToPath(5)).to.deep.eq([1, 0, 2, 0]);
        expect(seq2.indexToPath(6)).to.deep.eq([1, 1, 0, 0]);
        expect(seq2.indexToPath(9)).to.deep.eq([1, 1, 3, 0]);
        expect(() => seq2.indexToPath(10)).to.throw();
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


    it('should assign decorations to the time slots of a sequence', () => {
        const seq1 = new FlexibleSequence(seq1Text);
        
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
        const seq1 = new FlexibleSequence(seq1Text);
        
        seq1.insertElement(Time.newAbsolute(1, 4), { longDeco: LongDecorationType.Slur, length: Time.QuarterTime });

        const slots = seq1.groupByTimeSlots('x');
        expect(slots).to.have.length(3);

        expect(slots[1]).to.deep.include(
            { time: Time.newAbsolute(1, 4), states: [], decorations: [
                { longDeco: LongDecorationType.Slur, length: Time.QuarterTime }
            ]}
        );
    });

    describe('Serialisation', () => {
        it('should simplify notes to lilypond strings', () => {
            const seq = new FlexibleSequence([seq1Text, [seq3Text, seq2Text]]);
            const seq2 = new FlexibleSequence(seq.elements);
    
            expect(seq2.count).to.eq(10);
            expect(seq2.def).to.deep.eq(['c4', 'd8', 'e8', 'c,2', 'd,8', '<e, c>4', 'c,2', 'd,8', 'e,8', 'c4']);
        });
    
    
    });

    describe('Composite FlexibleSequence', () => {
        it('should combine the notes of several sequences', () => {
            const seqCombined = new FlexibleSequence([seq1Text, seq2Text]);

            expect(seqCombined.duration).to.deep.equal(Time.newSpan(3, 2));
            expect(seqCombined.elements).to.have.length(7);

            expect(seqCombined.elements[0]).to.deep.equal(createNoteFromLilypond('c4'));
            expect(seqCombined.elements[5]).to.deep.equal(createNoteFromLilypond('e,8'));
        });

    });

    describe('Operations on FlexibleSequence', () => {
        it('should support insertElement', () => {
            const seq = new FlexibleSequence(seq1Text);

            seq.insertElement(Time.newAbsolute(1, 4), 'e4');

            expect(seq.elements).to.have.length(4);
            expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
            expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('e4'));
            expect(seq.elements[2]).to.deep.eq(createNoteFromLilypond('d8'));
            expect(seq.elements[3]).to.deep.eq(createNoteFromLilypond('e8'));
        });

        it('should support appendElement', () => {
            const seq = new FlexibleSequence(seq1Text);

            seq.appendElement('e4');

            expect(seq.elements).to.have.length(4);
            expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
            expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('d8'));
            expect(seq.elements[2]).to.deep.eq(createNoteFromLilypond('e8'));
            expect(seq.elements[3]).to.deep.eq(createNoteFromLilypond('e4'));
        });

        it('should support deleteElement', () => {
            const seq = new FlexibleSequence(seq1Text);

            seq.deleteElement(Time.newAbsolute(1, 4));

            expect(seq.elements).to.have.length(2);
            expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
            expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('e8'));
        });

        it('should support modifyElement', () => {
            const seq = new FlexibleSequence(seq1Text);

            seq.modifyElement(Time.newAbsolute(1, 4), () => 'f4');

            expect(seq.elements).to.have.length(3);
            expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
            expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('f4'));
            expect(seq.elements[2]).to.deep.eq(createNoteFromLilypond('e8'));
        });

        it('should support insertElement, using index', () => {
            const seq = new FlexibleSequence(seq1Text);

            seq.insertElement(1, 'e4');

            expect(seq.elements).to.have.length(4);
            expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
            expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('e4'));
            expect(seq.elements[2]).to.deep.eq(createNoteFromLilypond('d8'));
            expect(seq.elements[3]).to.deep.eq(createNoteFromLilypond('e8'));
        });

        it('should support deleteElement, using index', () => {
            const seq = new FlexibleSequence(seq1Text);

            seq.deleteElement(1);

            expect(seq.elements).to.have.length(2);
            expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
            expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('e8'));
        });

        it('should support modifyElement, using index', () => {
            const seq = new FlexibleSequence(seq1Text);

            seq.modifyElement(1, () => 'f4');

            expect(seq.elements).to.have.length(3);
            expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
            expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('f4'));
            expect(seq.elements[2]).to.deep.eq(createNoteFromLilypond('e8'));
        });

        // could be some sort of 
        //    where time = x
        //        (or where index = i)
        //        (or where element matches f(element) or R.where)
        //        (or at end of seq)
        //    modify event => f(event)
        //        (or insert or delete)


    });

    describe('asObject', () => {
        it('should serialize an empty sequence correctly', () => {
            expect(new FlexibleSequence([]).asObject).to.deep.eq([]);
        });
        it('should serialize an empty sequence correctly', () => {
            expect(new FlexibleSequence('').asObject).to.deep.eq(['']);
        });
        it('should serialize an ordinary sequence correctly', () => {
            expect(new FlexibleSequence('c4. e8').asObject).to.deep.eq(['c4.', 'e8']);
        });
        xit('should serialize a variable reference correctly', () => {
            expect(
                new FlexibleSequence(
                    [{ variable: 'test'}], 
                    createRepo({test: 'd4 e4'})
                ).asObject
            ).to.deep.eq([{ variable: 'test'}]);
        });
    });
});

