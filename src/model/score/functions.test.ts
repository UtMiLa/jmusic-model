import { Pitch } from './../pitches/pitch';
import { createNoteFromLilypond, Note } from './../notes/note';
import { Time } from '../rationals/time';
import { getDuration } from './sequence';
import { expect } from 'chai';
import { FlexibleSequence } from './flexible-sequence';
import { createFunction, createInverseFunction } from './functions';
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


        it('should map inverse function', () => {
            const seq = new FlexibleSequence('cis4 des4 e8 f4.');

            const fun = createFunction('Transpose', [{ interval: 3, alteration: 0 }]);

            const res = fun(seq.elements);

            const inverseFun = createInverseFunction('Transpose', [{ interval: 3, alteration: 0 }]);

            const inverseRes = inverseFun(res);

            expect(inverseRes).to.deep.eq(seq.elements);
        });
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
        it('should revert notes', () => {
            const seq = new FlexibleSequence('cis4 des4 e8 f4.');

            const fun = createFunction('Reverse');

            const res = fun(seq.elements);

            expect(res).to.have.length(4);
            expect(res).to.deep.eq(new FlexibleSequence('f4. e8 des4 cis4').elements);
        });
    });

    describe('Inversion', () => {
        it('should invert notes', () => {
            const seq = new FlexibleSequence('cis4 r4 des4 e8 f4.');

            const fun = createFunction('Invert', [Pitch.parseLilypond('g')]);

            const res = fun(seq.elements);

            expect(res).to.have.length(5);
            expect(res).to.deep.eq(new FlexibleSequence('des\'4 r4 cis\'4 bes8 a4.').elements);
        });
    });

    describe('Change node properties', () => {
        it('should update notes', () => {
            const seq = new FlexibleSequence('cis4 r4 des4 e8 f4.');

            const fun = createFunction('UpdateNote', [{ expressions: ['staccato'] }]);

            const res = fun(seq.elements);

            expect(res).to.have.length(5);
            expect(res).to.deep.eq(new FlexibleSequence('cis4\\staccato r4 des4\\staccato e8\\staccato f4.\\staccato').elements);
        });
    });

    describe('Repeat', () => {
        it('should repeat notes n times', () => {
            const seq = new FlexibleSequence('cis4 r4 des4 e8 f4.');

            const fun = createFunction('Repeat', [3]);

            const res = fun(seq.elements);

            expect(res).to.have.length(15);
            expect(res).to.deep.eq(new FlexibleSequence('cis4 r4 des4 e8 f4. cis4 r4 des4 e8 f4. cis4 r4 des4 e8 f4.').elements);
        });
    });

    describe('Rest', () => {
        it('should make notes to rests', () => {
            const seq = new FlexibleSequence('cis4 r4 des4 e8 f4.');

            const fun = createFunction('Rest');

            const res = fun(seq.elements);

            expect(res).to.have.length(5);
            expect(res).to.deep.eq(new FlexibleSequence('r4 r4 r4 r8 r4.').elements);
        });
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
        it('should arpeggiate a sequence', () => {
            const seq3Text = '<gis, cis e>1 <gis, dis fis>2 <gis, cis e>2';
            const seq3Pattern = 'c8. d16 e8 d8';
            const seq3TextArp = 'gis,8. cis16 e8 cis8 gis,8. cis16 e8 cis8 gis,8. dis16 fis8 dis8 gis,8. cis16 e8 cis8';
            const fun = createFunction('Arpeggio', [seq3Pattern]);

            const res = fun(new FlexibleSequence(seq3Text).elements);

            expect(res).to.deep.eq(new FlexibleSequence(seq3TextArp).elements);
        });
        
        it('should arpeggiate a sequence with tuplets', () => {
            const seq3Text = '<gis, cis e>1 <gis, dis fis>4 <gis, cis e>4';
            const seq3Pattern = [{ 'function': 'Tuplet', extraArgs: [{ numerator: 2, denominator: 3 }], args: ['c8 d8 e8'] }];
            const seq3TextArp = [
                { 'function': 'Tuplet' as FuncDef, extraArgs: [{ numerator: 2, denominator: 3 }], args: ['gis,8 cis8 e8'] },
                { 'function': 'Tuplet' as FuncDef, extraArgs: [{ numerator: 2, denominator: 3 }], args: ['gis,8 cis8 e8'] },
                { 'function': 'Tuplet' as FuncDef, extraArgs: [{ numerator: 2, denominator: 3 }], args: ['gis,8 cis8 e8'] },
                { 'function': 'Tuplet' as FuncDef, extraArgs: [{ numerator: 2, denominator: 3 }], args: ['gis,8 cis8 e8'] },
                { 'function': 'Tuplet' as FuncDef, extraArgs: [{ numerator: 2, denominator: 3 }], args: ['gis,8 dis8 fis8'] },
                { 'function': 'Tuplet' as FuncDef, extraArgs: [{ numerator: 2, denominator: 3 }], args: ['gis,8 cis8 e8'] }
            ];
            const fun = createFunction('Arpeggio', [seq3Pattern]);

            const res = fun(new FlexibleSequence(seq3Text).elements);

            expect(res).to.deep.eq(new FlexibleSequence(seq3TextArp).elements);
        });


                
        it('should fail if note is shorter than pattern', () => {
            const seq3Text = '<gis, cis e>1 <gis, dis fis>8 <gis, cis e>4';
            const seq3Pattern = [{ 'function': 'Tuplet', extraArgs: [{ numerator: 2, denominator: 3 }], args: ['c8 d8 e8'] }];
            const fun = createFunction('Arpeggio', [seq3Pattern]);

            expect(() => fun(new FlexibleSequence(seq3Text).elements)).to.throw(/Cannot arpeggiate chord shorter/);
        });
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