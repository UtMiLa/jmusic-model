import { expect } from 'chai';
import { Pitch } from './pitch';
describe('Pitch', () => {
    let pc: Pitch, pd: Pitch, pb: Pitch;
    beforeEach(() => { 
        pc = Pitch.parseScientific('c4');
        pd = Pitch.parseScientific('d5');
        pb = Pitch.parseScientific('b1');
    });

    it('should parse a pitch', () => {
        const pitch = Pitch.parseScientific('c4');
        expect(pitch.scientific).to.equal('C4');
    });
    it('should get correct octave from a pitch', () => {
        expect(pc.octave).to.equal(4);
        expect(pd.octave).to.equal(5);
        expect(pb.octave).to.equal(1);
    });
    it('should get correct pitch class from a pitch', () => {
        expect(pc.pitchClassName).to.equal('c');
        expect(pd.pitchClassName).to.equal('d');
        expect(pb.pitchClassName).to.equal('b');
    });
    it('should compare pitches correctly', () => {
        expect(Pitch.compare(pc, pd)).to.be.lt(0);
        expect(Pitch.compare(pb, pd)).to.be.lt(0);
        expect(Pitch.compare(pc, pb)).to.be.gt(0);
        expect(Pitch.compare(pc, pc)).to.be.eq(0);
    });

    it('should parse an alternated pitch', () => {
        let pitch = Pitch.parseLilypond('des');
        expect(pitch.pitchClass).to.equal(1);
        expect(pitch.alteration).to.equal(-1);

        pitch = Pitch.parseLilypond('deses');
        expect(pitch.pitchClass).to.equal(1);
        expect(pitch.alteration).to.equal(-2);

        pitch = Pitch.parseLilypond('dis');
        expect(pitch.pitchClass).to.equal(1);
        expect(pitch.alteration).to.equal(1);

        pitch = Pitch.parseLilypond('disis');
        expect(pitch.pitchClass).to.equal(1);
        expect(pitch.alteration).to.equal(2);

        pitch = Pitch.parseLilypond('d');
        expect(pitch.pitchClass).to.equal(1);
        expect(pitch.alteration).to.equal(0);
    });

});