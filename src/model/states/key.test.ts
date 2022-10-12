import { Time } from './../rationals/time';
import { Sequence, __internal } from './../score/sequence';
import { PitchClass } from './../pitches/pitch';
import { Key, AccidentalManager, displaceAccidentals } from './key';
import { Pitch } from '../pitches/pitch';
import { expect } from 'chai';

describe('Key', () => {
    let keyEs: Key, keyH: Key;
    
    beforeEach(() => {
        keyEs = new Key({
            accidental: -1,
            count: 3
        });
        keyH = new Key({
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
        expect(pitches[0].pitchClassName).to.equal('b');
        expect(pitches[1].pitchClassName).to.equal('e');
        expect(pitches[2].pitchClassName).to.equal('a');
    });

    it('should enumerate sharps', () => {
        const pitches = Array.from<PitchClass>(keyH.enumerate());
        expect(pitches.length).to.equal(5);
        expect(pitches[0].alteration).to.equal(1);
        expect(pitches[0].pitchClassName).to.equal('f');
        expect(pitches[1].pitchClassName).to.equal('c');
        expect(pitches[2].pitchClassName).to.equal('g');
        expect(pitches[3].pitchClassName).to.equal('d');
        expect(pitches[4].pitchClassName).to.equal('a');
    });

    it('should parse a key change', () => {
        const seq = new Sequence({ elements: 'c4 \\key d \\major c4' });

        expect(seq.count).to.eq(3);
        /*expect(seq.elements[1]).to.deep.eq({
            key: new Key({
                accidental: 1,
                count: 2
            }),
            duration: Time.newSpan(0, 1),
            isState: true
        });*/

        const seq2 = new Sequence({ elements: 'c4 \\key ees \\minor c4' });

        expect(seq2.count).to.eq(3);
        expect(seq2.elements[1]).to.deep.eq({
            key: new Key({
                accidental: -1,
                count: 6
            }),
            duration: Time.newSpan(0, 1),
            isState: true
        });

    });


    it('should parse all key change types', () => {
        expect(__internal.parseLilyKey('\\key c \\major')).to.deep.eq(new Key({ accidental: 0, count: 0 }));
        expect(__internal.parseLilyKey('\\key d \\major')).to.deep.eq(new Key({ accidental: 1, count: 2 }));
        expect(__internal.parseLilyKey('\\key e \\major')).to.deep.eq(new Key({ accidental: 1, count: 4 }));
        expect(__internal.parseLilyKey('\\key ees \\major')).to.deep.eq(new Key({ accidental: -1, count: 3 }));
        expect(__internal.parseLilyKey('\\key f \\major')).to.deep.eq(new Key({ accidental: -1, count: 1 }));
        expect(__internal.parseLilyKey('\\key g \\major')).to.deep.eq(new Key({ accidental: 1, count: 1 }));
        expect(__internal.parseLilyKey('\\key a \\major')).to.deep.eq(new Key({ accidental: 1, count: 3 }));
        expect(__internal.parseLilyKey('\\key b \\major')).to.deep.eq(new Key({ accidental: 1, count: 5 }));

        expect(__internal.parseLilyKey('\\key c \\minor')).to.deep.eq(new Key({ accidental: -1, count: 3 }));
        expect(__internal.parseLilyKey('\\key d \\minor')).to.deep.eq(new Key({ accidental: -1, count: 1 }));
        expect(__internal.parseLilyKey('\\key e \\minor')).to.deep.eq(new Key({ accidental: 1, count: 1 }));
        expect(__internal.parseLilyKey('\\key ees \\minor')).to.deep.eq(new Key({ accidental: -1, count: 6 }));
        expect(__internal.parseLilyKey('\\key f \\minor')).to.deep.eq(new Key({ accidental: -1, count: 4 }));
        expect(__internal.parseLilyKey('\\key g \\minor')).to.deep.eq(new Key({ accidental: -1, count: 2 }));
        expect(__internal.parseLilyKey('\\key a \\minor')).to.deep.eq(new Key({ accidental: 0, count: 0 }));
        expect(__internal.parseLilyKey('\\key b \\minor')).to.deep.eq(new Key({ accidental: 1, count: 2 }));

    });



    describe('Accidental rule', () => {
        it('should correctly set accidentals', () => {
            const accMan = new AccidentalManager();

            accMan.setKey(keyEs);
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
            expect(accMan.getAccidental(new Pitch(2, 5, -1))).to.eq(-1); // e''
            
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
});