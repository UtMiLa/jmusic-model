import { PitchClass } from './../pitches/pitch';
import { Key, AccidentalManager } from './key';
import { Pitch } from '../pitches/pitch';
import { Clef, ClefType } from './clef';
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
        expect(pitches[0].alternation).to.equal(-1);
        expect(pitches[0].pitchClassName).to.equal('b');
        expect(pitches[1].pitchClassName).to.equal('e');
        expect(pitches[2].pitchClassName).to.equal('a');
    });

    it('should enumerate sharps', () => {
        const pitches = Array.from<PitchClass>(keyH.enumerate());
        expect(pitches.length).to.equal(5);
        expect(pitches[0].alternation).to.equal(1);
        expect(pitches[0].pitchClassName).to.equal('f');
        expect(pitches[1].pitchClassName).to.equal('c');
        expect(pitches[2].pitchClassName).to.equal('g');
        expect(pitches[3].pitchClassName).to.equal('d');
        expect(pitches[4].pitchClassName).to.equal('a');
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
    
    });
});