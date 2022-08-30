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
        expect(pc.pitchClass).to.equal('c');
        expect(pd.pitchClass).to.equal('d');
        expect(pb.pitchClass).to.equal('b');
    });
    it('should compare pitches correctly', () => {
        expect(Pitch.compare(pc, pd)).to.be.lt(0);
        expect(Pitch.compare(pb, pd)).to.be.lt(0);
        expect(Pitch.compare(pc, pb)).to.be.gt(0);
        expect(Pitch.compare(pc, pc)).to.be.eq(0);
    });

});