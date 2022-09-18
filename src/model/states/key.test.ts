import { PitchClass } from './../pitches/pitch';
import { Key } from './key';
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
        expect(pitches[0].pitchClass).to.equal('b');
        expect(pitches[1].pitchClass).to.equal('e');
        expect(pitches[2].pitchClass).to.equal('a');
    });

    it('should enumerate sharps', () => {
        const pitches = Array.from<PitchClass>(keyH.enumerate());
        expect(pitches.length).to.equal(5);
        expect(pitches[0].alternation).to.equal(1);
        expect(pitches[0].pitchClass).to.equal('f');
        expect(pitches[1].pitchClass).to.equal('c');
        expect(pitches[2].pitchClass).to.equal('g');
        expect(pitches[3].pitchClass).to.equal('d');
        expect(pitches[4].pitchClass).to.equal('a');
    });


});