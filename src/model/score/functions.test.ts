import { Pitch } from './../pitches/pitch';
import { createNoteFromLilypond, Note } from './../notes/note';
import { Time } from '../rationals/time';
import { getDuration } from './sequence';
import { expect } from 'chai';
import { FlexibleSequence } from './flexible-sequence';
import { createFunction } from './functions';
import { FuncDef, SeqFunction, SequenceItem, TupletState } from '..';

// Inspiration: Lilypond functions https://lilypond.org/doc/v2.25/Documentation/notation/available-music-functions

describe('Functions', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    //const seq4Text = 'c,2 d,8 <e, c>4';


    beforeEach(() => { 
        //
    });


    it('should be possible to use a function in FlexibleSqeuences', () => {
        const seqWithFunction = ['c4', {function: 'Reverse' as FuncDef, args: ['d4 e4 f4']} as SeqFunction];

        const seq = new FlexibleSequence(seqWithFunction);

        expect(seq.count).to.eq(4);
        expect(seq.def).to.deep.eq(['c4', {function: 'Reverse', args: ['d4', 'e4', 'f4']}]);
        expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
        expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('f4'));
    });


    
    it('should be possible to use different functions in FlexibleSequences', () => {
        
        const seqWithFunction = ['c4', {function: 'Repeat' as FuncDef, args: ['d4 e4 f4'], extraArgs: [2]} as SeqFunction];

        const seq = new FlexibleSequence(seqWithFunction);

        expect(seq.count).to.eq(7);
        expect(seq.def).to.deep.eq(['c4', {function: 'Repeat', args: ['d4', 'e4', 'f4'], extraArgs: [2] }]);
        expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
        expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('d4'));
        expect(seq.elements[3]).to.deep.eq(createNoteFromLilypond('f4'));
        expect(seq.elements[4]).to.deep.eq(createNoteFromLilypond('d4'));
    });

    
    
    it('should be possible to use different functions with extra arguments FlexibleSequences', () => {
        const seqWithFunction = ['c4', {function: 'Repeat' as FuncDef, args: 'd4 e4 f4', extraArgs: [3]} as SeqFunction];

        const seq = new FlexibleSequence(seqWithFunction);

        expect(seq.count).to.eq(10);
        expect(seq.def).to.deep.eq(['c4', {function: 'Repeat', args: ['d4', 'e4', 'f4'], extraArgs: [3]}]);
        expect(seq.elements[0]).to.deep.eq(createNoteFromLilypond('c4'));
        expect(seq.elements[1]).to.deep.eq(createNoteFromLilypond('d4'));
        expect(seq.elements[3]).to.deep.eq(createNoteFromLilypond('f4'));
        expect(seq.elements[4]).to.deep.eq(createNoteFromLilypond('d4'));
        expect(seq.elements[7]).to.deep.eq(createNoteFromLilypond('d4'));
    });


});



describe('Flexible sequence transformations', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    const seq4Text = 'c,16 d,16 e,16';

    beforeEach(() => { 
        //
    });

    it('should create the retrograde of a sequence', () => {
        const seq1 = new FlexibleSequence(seq3Text);
        const retro = new FlexibleSequence([{ function: 'Reverse', args: [seq3Text]}]);
        
        expect(retro.elements.length).to.equal(3);
        expect(retro.duration).to.deep.equal(Time.newSpan(7, 8));
        expect(seq1.elements[0]).to.deep.equal(createNoteFromLilypond('c,2'));
        expect(retro.elements[2]).to.deep.equal(createNoteFromLilypond('c,2'));
        expect(retro.elements[0]).to.deep.equal(createNoteFromLilypond('<e, c>4'));
    });


    it('should map an element index to a path even when functions are present', () => {
        const seq = new FlexibleSequence([seq1Text, { function: 'Reverse', args: [seq3Text]}, seq2Text]);

        expect(seq.indexToPath(0)).to.deep.eq([0]);
        expect(seq.indexToPath(2)).to.deep.eq([2]);
        expect(seq.indexToPath(6)).to.deep.eq([4]);
        expect(() => seq.indexToPath(10)).to.throw();
    });

    it('should create the a tuplet group from a sequence', () => {
        const seq1 = new FlexibleSequence(seq1Text);
        const tuplet = new FlexibleSequence([{ function:'Tuplet', args: [seq1Text], extraArgs: [{ numerator: 2, denominator: 3 }]} as SeqFunction]);
        
        expect(tuplet.elements.length).to.equal(3);
        expect(tuplet.duration).to.deep.equal(Time.newSpan(1, 3));
        expect(getDuration(seq1.elements[0])).to.deep.equal(Time.newSpan(1, 4));
        expect(getDuration(tuplet.elements[0])).to.deep.equal(Time.newSpan(1, 6));
        expect(getDuration(tuplet.elements[2])).to.deep.equal(Time.newSpan(1, 12));
        
    });

    it('should create a tuplet group from a tuplet sequence', () => {
        //const seq1 = SimpleSequence.createFromString(seq1Text);
        //const tuplet = new TupletSequence(seq1, { numerator: 2, denominator: 3 });
        const tuplet = new FlexibleSequence([{ function:'Tuplet', args: [seq1Text], extraArgs: [{ numerator: 2, denominator: 3 }]} as SeqFunction]);
        
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
        //const seq1 = SimpleSequence.createFromString(seq1Text);
        //const tuplet = new TupletSequence(seq1, { numerator: 2, denominator: 3 });
        const tuplet = new FlexibleSequence([{ function:'Tuplet', args: [seq1Text], extraArgs: [{ numerator: 2, denominator: 3 }]} as SeqFunction]);
        const tuplet1 = new FlexibleSequence([{ function:'Reverse', args: [tuplet.def as SequenceItem] }]); // todo: tuplet.def should not be casted
        
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
        const seq1 = new FlexibleSequence(seq1Text);
        const graceDef = { function: 'Grace', args: seq4Text } as SeqFunction;
        const graceSeq = new FlexibleSequence([graceDef]);
        
        const slots = graceSeq.groupByTimeSlots('x');
        expect(slots).to.have.length(3);
        expect(slots[0].elements[0], '0-0 first').to.deep.include({
            grace: true
        });
        expect(graceSeq.duration).to.deep.eq(Time.NoTime);
        
        const combiSeq = new FlexibleSequence([graceDef, seq1Text]);
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
        //const seq1 = SimpleSequence.createFromString(seq1Text);
        const graceDef = { function: 'Grace', args: seq4Text } as SeqFunction;
        const graceSeq = new FlexibleSequence([graceDef]);
        const combiSeq = new FlexibleSequence([graceDef, seq1Text]);

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

    describe('Transpose modally', () => {
        it('should');
    });

    describe('Transpose chromatically', () => {
        it('should transpose a sequence by an interval', () => {
            const seq = new FlexibleSequence('cis4 des4 e8 f4.');

            const fun = createFunction('Transpose', [{ interval: 3, alteration: 0 }]);

            const res = fun(seq.elements);

            expect(res).to.have.length(4);
            expect(res[0]).to.deep.eq(createNoteFromLilypond('fis4'));
            expect(res[1]).to.deep.eq(createNoteFromLilypond('ges4'));
            expect(res[2]).to.deep.eq(createNoteFromLilypond('a8'));
            expect(res[3]).to.deep.eq(createNoteFromLilypond('bes4.'));

            const fun2 = createFunction('Transpose', [{ interval: 1, alteration: -1 }]);

            const res2 = fun2(seq.elements);

            expect(res2).to.have.length(4);
            expect(res2[0]).to.deep.eq(createNoteFromLilypond('d4'));
            expect(res2[1]).to.deep.eq(createNoteFromLilypond('eeses4'));
            expect(res2[2]).to.deep.eq(createNoteFromLilypond('f8'));
            expect(res2[3]).to.deep.eq(createNoteFromLilypond('ges4.'));
        });


        /*xit('should map inverse function', () => {
            const seq = new FlexibleSequence('cis4 des4 e8 f4.');

            const fun = createFunction('Transpose', [{ interval: 3, alteration: 0 }]);

            const res = fun(seq.elements);

            //const inverseFun = createInverseFunction('Transpose', [{ interval: 3, alteration: 0 }]);

            // update(seq, elementNo, updater: (oldNote) => [newNotes])
            // 
            // ( R.promap(transpose(interval), transpose(-interval), updater)
        });*/
    });

    describe('Relative', () => {
        function expectRelative(fromseq: string, startNote: string, toSeq: string) {
            const seq1 = new FlexibleSequence(fromseq);
            const seq2 = new FlexibleSequence(toSeq);
            const fun = createFunction('Relative', [Pitch.parseLilypond(startNote)]);
            expect(fun(seq1.elements), `${fromseq} - ${startNote}`).to.deep.eq(seq2.elements);
        }

        it('should adjust octave the same way as Lilypond \\relative', () => {
            expectRelative('c4', 'f', 'c4');
            expectRelative('c4', 'f\'', 'c\'4');
            expectRelative('c4', 'f,', 'c,4');
            expectRelative('c,4', 'f', 'c,4');
            expectRelative('c\'4', 'f', 'c\'4');
            expectRelative('c,,4', 'f', 'c,,4');
            expectRelative('b4', 'f', 'b4');
            expectRelative('d8', 'g', 'd8');
            expectRelative('c8', 'g', 'c\'8');
            expectRelative('c4 e8 a16 d16 g1', 'c', 'c4 e8 a16 d\'16 g\'1');
            expectRelative('cis4 ees8 ais16 des16 g1', 'c', 'cis4 ees8 ais16 des\'16 g\'1');
        });


        it('should adjust octaves after first note in chords', () => {
            expectRelative('c\'4 <c e g>4 <c\' e g\'>4 <c, e, g\'\'>4', 'c', 'c\'4 <c\' e\' g\'>4 <c\'\' e\'\' g\'\'\'>4 <c\' e g\'\'>4');
        });

    });

    describe('Retrograde', () => {
        it('should');
    });

    describe('Inversion', () => {
        it('should');
    });

    describe('Change node properties', () => {
        it('should');
    });

    describe('Repeat', () => {
        it('should');
    });

    describe('Rest', () => {
        it('should');
    });

    describe('Extend', () => {
        it('should');
    });

    describe('Tremolo', () => {
        it('should replace notes with repeated notes of given value', () => {
            const seq3Text = 'c,2 d,8 <e, c>4';
            const seq3TextTremo = 'c,8 c,8 c,8 c,8 d,8 <e, c>8 <e, c>8';
            const fun = createFunction('Tremolo', [Time.EightsTime]);

            const res = fun(new FlexibleSequence(seq3Text).elements);

            expect(res).to.have.length(7);
            expect(res).to.deep.eq(new FlexibleSequence(seq3TextTremo).elements);
        });
    });

    describe('Augmentation', () => {
        it('should augment a sequence', () => {
            const seq3Text = 'c,2 d,8 <e, c>4';
            const seq3TextAugm = 'c,1 d,4 <e, c>2';
            const fun = createFunction('Augment', [{ numerator: 2, denominator: 1 }]);

            const res = fun(new FlexibleSequence(seq3Text).elements);

            expect(res).to.have.length(3);
            expect(res).to.deep.eq(new FlexibleSequence(seq3TextAugm).elements);
        });

        it('should diminish a sequence', () => {
            const seq3Text = 'c,2 d,8 <e, c>4';
            const seq3TextAugm = 'c,8 d,32 <e, c>16';
            const fun = createFunction('Augment', [{ numerator: 1, denominator: 4 }]);

            const res = fun(new FlexibleSequence(seq3Text).elements);

            expect(res).to.have.length(3);
            expect(res).to.deep.eq(new FlexibleSequence(seq3TextAugm).elements);
        });
    });

    describe('ReplaceValue', () => {
        it('should');
    });

    describe('ReplacePitch', () => {
        it('should');
    });

    describe('ReplacePattern', () => {
        it('should');
    });

    describe('Cut', () => {
        it('should');
    });

    describe('Sample', () => {
        it('should');
    });

    describe('Delay', () => {
        it('should');
    });

    describe('Merge', () => {
        it('should');
    });

    describe('Add Passing notes', () => {
        it('should');
    });

    describe('Arpeggiate', () => {
        it('should');
    });

    describe('Collapse arpeggios to chords', () => {
        it('should');
    });

    describe('Get Voice from chords', () => {
        it('should');
    });

    describe('Combine voices to chords', () => {
        it('should');
    });


});