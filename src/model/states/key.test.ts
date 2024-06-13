import { Time } from './../rationals/time';
import { parseLilyKey, SimpleSequence, __internal } from './../score/sequence';
import { PitchClass } from './../pitches/pitch';
import { Key, AccidentalManager, displaceAccidentals, keyToLilypond, IrregularKey, combineAlterations, DiatonicKey } from './key';
import { Pitch } from '../pitches/pitch';
import { expect } from 'chai';

describe('Key', () => {
    let keyEs: Key, keyH: Key;
    
    beforeEach(() => {
        keyEs = new DiatonicKey({
            accidental: -1,
            count: 3
        });
        keyH = new DiatonicKey({
            accidental: 1,
            count: 5
        });
    });

    it('should create a key object', () => {
        expect(keyEs).to.exist;
    });

    it('should enumerate flats', () => {
        const pitches = Array.from<PitchClass>(keyEs.enumerate());
        expect(pitches.length).to.equal(3);
        expect(pitches[0].alteration).to.equal(-1);
        expect(pitches[0].pitchClassName).to.equal('bes');
        expect(pitches[1].pitchClassName).to.equal('ees');
        expect(pitches[2].pitchClassName).to.equal('aes');
    });

    it('should enumerate sharps', () => {
        const pitches = Array.from<PitchClass>(keyH.enumerate());
        expect(pitches.length).to.equal(5);
        expect(pitches[0].alteration).to.equal(1);
        expect(pitches[0].pitchClassName).to.equal('fis');
        expect(pitches[1].pitchClassName).to.equal('cis');
        expect(pitches[2].pitchClassName).to.equal('gis');
        expect(pitches[3].pitchClassName).to.equal('dis');
        expect(pitches[4].pitchClassName).to.equal('ais');
    });

    it('should parse a key change', () => {
        const seq = new SimpleSequence( 'c4 \\key d \\major c4' );

        expect(seq.count).to.eq(3);
        expect(seq.elements[1]).to.deep.eq({
            key: new DiatonicKey({
                accidental: 1,
                count: 2
            }),
            isState: true
        });

        const seq2 = new SimpleSequence( 'c4 \\key ees \\minor c4' );

        expect(seq2.count).to.eq(3);
        expect(seq2.elements[1]).to.deep.eq({
            key: new DiatonicKey({
                accidental: -1,
                count: 6
            }),
            isState: true
        });

    });


    it('should parse all key change types', () => {
        expect(parseLilyKey('\\key c \\major')).to.deep.eq(new DiatonicKey({ accidental: 0, count: 0 }));
        expect(parseLilyKey('\\key d \\major')).to.deep.eq(new DiatonicKey({ accidental: 1, count: 2 }));
        expect(parseLilyKey('\\key e \\major')).to.deep.eq(new DiatonicKey({ accidental: 1, count: 4 }));
        expect(parseLilyKey('\\key ees \\major')).to.deep.eq(new DiatonicKey({ accidental: -1, count: 3 }));
        expect(parseLilyKey('\\key f \\major')).to.deep.eq(new DiatonicKey({ accidental: -1, count: 1 }));
        expect(parseLilyKey('\\key g \\major')).to.deep.eq(new DiatonicKey({ accidental: 1, count: 1 }));
        expect(parseLilyKey('\\key a \\major')).to.deep.eq(new DiatonicKey({ accidental: 1, count: 3 }));
        expect(parseLilyKey('\\key b \\major')).to.deep.eq(new DiatonicKey({ accidental: 1, count: 5 }));

        expect(parseLilyKey('\\key c \\minor')).to.deep.eq(new DiatonicKey({ accidental: -1, count: 3 }));
        expect(parseLilyKey('\\key d \\minor')).to.deep.eq(new DiatonicKey({ accidental: -1, count: 1 }));
        expect(parseLilyKey('\\key e \\minor')).to.deep.eq(new DiatonicKey({ accidental: 1, count: 1 }));
        expect(parseLilyKey('\\key ees \\minor')).to.deep.eq(new DiatonicKey({ accidental: -1, count: 6 }));
        expect(parseLilyKey('\\key f \\minor')).to.deep.eq(new DiatonicKey({ accidental: -1, count: 4 }));
        expect(parseLilyKey('\\key g \\minor')).to.deep.eq(new DiatonicKey({ accidental: -1, count: 2 }));
        expect(parseLilyKey('\\key a \\minor')).to.deep.eq(new DiatonicKey({ accidental: 0, count: 0 }));
        expect(parseLilyKey('\\key b \\minor')).to.deep.eq(new DiatonicKey({ accidental: 1, count: 2 }));

    });

    it('should stringify all key change types', () => {
        expect(keyToLilypond(new DiatonicKey({ accidental: 0, count: 0 }))).to.deep.eq('\\key c \\major');
        expect(keyToLilypond(new DiatonicKey({ accidental: 1, count: 2 }))).to.deep.eq('\\key d \\major');
        expect(keyToLilypond(new DiatonicKey({ accidental: 1, count: 4 }))).to.deep.eq('\\key e \\major');
        expect(keyToLilypond(new DiatonicKey({ accidental: -1, count: 3 }))).to.deep.eq('\\key ees \\major');
        expect(keyToLilypond(new DiatonicKey({ accidental: -1, count: 1 }))).to.deep.eq('\\key f \\major');
        expect(keyToLilypond(new DiatonicKey({ accidental: 1, count: 1 }))).to.deep.eq('\\key g \\major');
        expect(keyToLilypond(new DiatonicKey({ accidental: 1, count: 3 }))).to.deep.eq('\\key a \\major');
        expect(keyToLilypond(new DiatonicKey({ accidental: 1, count: 5 }))).to.deep.eq('\\key b \\major');

    });

    it('should compare two key changes', () => {
        const key1 = parseLilyKey('\\key d \\major');
        const key2 = parseLilyKey('\\key b \\minor');
        const key3 = parseLilyKey('\\key d \\minor');

        expect(key1.equals(key2)).to.be.true;
        expect(key3.equals(key1)).to.be.false;
    });

    it('should transpose a key', () => {
        expect(parseLilyKey('\\key d \\major').transpose({ interval: 0, alteration: 0})).to.deep.eq(parseLilyKey('\\key d \\major'));
        expect(parseLilyKey('\\key d \\major').transpose({ interval: 1, alteration: 1})).to.deep.eq(parseLilyKey('\\key e \\major'));
        expect(parseLilyKey('\\key d \\major').transpose({ interval: -1, alteration: -1})).to.deep.eq(parseLilyKey('\\key c \\major'));
        expect(parseLilyKey('\\key d \\major').transpose({ interval: 2, alteration: -1})).to.deep.eq(parseLilyKey('\\key f \\major'));
        expect(parseLilyKey('\\key c \\major').transpose({ interval: -1, alteration: -1})).to.deep.eq(parseLilyKey('\\key bes \\major'));
        expect(parseLilyKey('\\key c \\major').transpose({ interval: 1, alteration: 1})).to.deep.eq(parseLilyKey('\\key d \\major'));
        expect(parseLilyKey('\\key bes \\major').transpose({ interval: 1, alteration: 1})).to.deep.eq(parseLilyKey('\\key c \\major'));
    });

    describe('Accidental rule', () => {
        it('should correctly set accidentals', () => {
            const accMan = new AccidentalManager();

            expect(accMan.getAccidental(new Pitch(0, 4, 0))).to.be.undefined; // c'
            expect(accMan.getAccidental(new Pitch(0, 4, 0))).to.be.undefined; // c'
            expect(accMan.getAccidental(new Pitch(0, 3, 0))).to.be.undefined; // c
            expect(accMan.getAccidental(new Pitch(0, 4, 1))).to.eq(1); // cis'
            expect(accMan.getAccidental(new Pitch(0, 4, 1))).to.be.undefined; // cis'
            expect(accMan.getAccidental(new Pitch(0, 3, 1))).to.eq(1); // cis
            accMan.newBar();

            accMan.setKey(keyEs);
            expect(accMan.getAccidental(new Pitch(0, 4, 0))).to.be.undefined; // c'
            expect(accMan.getAccidental(new Pitch(0, 4, 0))).to.be.undefined; // c'
            expect(accMan.getAccidental(new Pitch(0, 4, 1))).to.eq(1); // cis'
            expect(accMan.getAccidental(new Pitch(0, 4, 1))).to.be.undefined; // cis'
            expect(accMan.getAccidental(new Pitch(0, 4, 0))).to.eq(0); // c'
            expect(accMan.getAccidental(new Pitch(2, 4, -1))).to.be.undefined; // es'
            expect(accMan.getAccidental(new Pitch(2, 4, 0))).to.eq(0); // e'
            expect(accMan.getAccidental(new Pitch(2, 4, 0))).to.be.undefined; // e'
            accMan.newBar();
            expect(accMan.getAccidental(new Pitch(2, 4, 0))).to.eq(0); // e'
            expect(accMan.getAccidental(new Pitch(2, 5, 0))).to.eq(0); // e'
            accMan.newBar();
            expect(accMan.getAccidental(new Pitch(2, 4, 0))).to.eq(0); // e'
            expect(accMan.getAccidental(new Pitch(2, 5, -1))).to.eq(-1); // es''
            
        });

        
        it('should correctly set accidental displacements', () => {
            // Alignment samples from Gardner Read: Music Notation, p.133-4
            //const accMan = new AccidentalManager();

            const twoVoiceSamples = [
                { in: 'f gis', out: [-1, 0] },
                { in: 'fis a', out: [-1, 0] },
                { in: 'f bes', out: [-1, 0] },
                { in: 'fis, cis', out: [-1, 0] },
                { in: 'f, d', out: [-1, 0] },
                { in: 'fis, ees', out: [0, 0] },
                { in: 'f, f', out: [0, 0] },
                { in: 'fis, gis', out: [0, 0] },
                { in: 'f, aes', out: [0, 0] }
            ];

            
            const threeVoiceSamples = [
                { in: 'fis, a, cis', out: [-1, -2, 0] },
                { in: 'a, d fis', out: [-1, -2, 0] },
                //{ in: 'ais, dis fis', out: [-1, -2, 0] },
                { in: 'fis, a, ees', out: [0, -1, 0] },
                { in: 'fis, cis fis', out: [0, -1, 0] },
                /*{ in: 'f, ges, bes,', out: [-2, -1, 0] }, todo: let notehead displacements influence accidental displacements
                { in: 'f, ges, f', out: [-2, -1, 0] },
                { in: 'f, aes, bes,', out: [-2, -1, 0] },*/
                { in: 'fis, ees fis', out: [0, -1, 0] } //1, -1, 0
            ];
            
            // Note: Not all 4 voice samples are supposed to be identical to the
            // suggested results; quote: "There can be no inflexible rules for accidental 
            // placement in structures that require four or more accidental signs"
            const fourVoiceSamples = [
                { in: 'fis, ais, cis fis', out: [0, -2, -1, 0] },
                //{ in: 'f, aes, des ges', out: [0, -2, -1, 0] },
                { in: 'dis, gis, dis fis', out: [-1, 0, -1, 0] },
                { in: 'aes,, ees, c aes', out: [-1, 0, -1, 0] },
                //{ in: 'g, bes, c ees', out: [0, -2, -1, 0] }, // 0, -2, -1, 1
                //{ in: 'g, bes, des ees', out: [0, -2, -1, 0] },
                //{ in: 'e, g, b, d e', out: [0, -2, -3, -1, 0] },
                { in: 'des, f, a, c e', out: [-1, 0, -2, -1, 0] },
                { in: 'dis, fis, b, dis fis', out: [-1, 0, -2, -1, 0] },
                { in: 'g, bes, des ees g', out: [0, -3, -2, -1, 0] }//,
                //{ in: 'des, f, aes, des f aes', out: [-1, -2, 0, -1, -2, 0] }
            ];


            twoVoiceSamples.forEach((sample, i) => {
                const pitches = sample.in.split(' ').map(pitchString => Pitch.parseLilypond(pitchString));
                const accidentals = pitches.map(pitch => pitch.diatonicNumber);
                const displacements = displaceAccidentals(accidentals);
                expect(displacements, 'error in twoVoiceSamples[' + i + ']').to.deep.equal(sample.out);
            });
            

            threeVoiceSamples.forEach((sample, i) => {
                const pitches = sample.in.split(' ').map(pitchString => Pitch.parseLilypond(pitchString));
                const accidentals = pitches.map(pitch => pitch.diatonicNumber);
                const displacements = displaceAccidentals(accidentals);
                expect(displacements, 'error in threeVoiceSamples[' + i + ']').to.deep.equal(sample.out);
            });
            
            fourVoiceSamples.forEach((sample, i) => {
                const pitches = sample.in.split(' ').map(pitchString => Pitch.parseLilypond(pitchString));
                const accidentals = pitches.map(pitch => pitch.diatonicNumber);
                const displacements = displaceAccidentals(accidentals);
                expect(displacements, 'error in fourVoiceSamples[' + i + ']').to.deep.equal(sample.out);
            });
            
        });


    });


    describe('Irregular key', () => {
        let irr1: IrregularKey;
        let irr2: IrregularKey;
        let irr3: IrregularKey;

        beforeEach(() => {
            irr1 = new IrregularKey([new PitchClass(3, 1), new PitchClass(6, -1)]); // f# bb
            irr2 = new IrregularKey([new PitchClass(2, -1)]); // eb
            irr3 = new IrregularKey([new PitchClass(6, -1), new PitchClass(2, -1)]); // bb db
        });

        it('should be able to create an irregular key', () => {
            expect(irr1).to.exist;
        });

        it('should enumerate alterations', () => {
            const pitches = Array.from<PitchClass>(irr1.enumerate());
            expect(pitches.length).to.equal(2);
            expect(pitches[0].alteration).to.equal(1);
            expect(pitches[0].pitchClassName).to.equal('fis');
            expect(pitches[1].pitchClassName).to.equal('bes');
        });
   
        
        it('should compare two key changes', () => {
            expect(irr1.equals(new IrregularKey([new PitchClass(3, 1), new PitchClass(6, -1)]))).to.be.true;
            expect(irr1.equals(irr2)).to.be.false;
        });
    
        /*
        Thoughts about transposing irregular keys
        """""""""""""""""""""""""""""""""""""""""
        To transpose non-diatonic key:
        * transpose each fixed alteration
        * transpose the diatonic scale
        * combine these, removing naturals

        Example:
        Transpose f# bb up/down a major second.
        Up:
        f# -> g#
        bb -> c
        diatonic scale: -> f# c# (c cancels c#)
        result: g# f# (or should it be f# g# ?)

        Down:
        f# -> e
        bb -> ab
        diatonic -> bb eb [e cancels eb]
        result: bb ab (or ab bb)

        Natural order of alterations should yield correct regular order for all transpositions of any regular key
        */
        it('should combine two enumerations', () => {
            const en1 = [new PitchClass(4, 1), new PitchClass(0, 0)]; // non-diatonic  g# c
            const en2 = [new PitchClass(3, 1), new PitchClass(0, 1)]; // diatonic      f# c#

            const combined = combineAlterations(en2, en1);

            expect(combined).to.deep.eq([new PitchClass(3, 1), new PitchClass(4, 1)]);
        });

        it('should transpose a key', () => {
            expect(irr1.transpose({ interval: 0, alteration: 0}).equals(irr1)).to.be.true;
            expect(irr1.transpose({ interval: -4, alteration: 0}).equals(irr2)).to.be.true;
            expect(irr1.transpose({ interval: 1, alteration: 0}).equals(irr3)).to.be.false;
        });
    
        // todo: lilypond i/o
    });
});