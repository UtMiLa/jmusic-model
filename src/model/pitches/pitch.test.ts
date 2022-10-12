import { expect } from 'chai';
import { Pitch, PitchClass } from './pitch';
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
        expect(pitch.pitchClassNumber).to.equal(1);
        expect(pitch.alteration).to.equal(-1);

        pitch = Pitch.parseLilypond('deses');
        expect(pitch.pitchClassNumber).to.equal(1);
        expect(pitch.alteration).to.equal(-2);

        pitch = Pitch.parseLilypond('dis');
        expect(pitch.pitchClassNumber).to.equal(1);
        expect(pitch.alteration).to.equal(1);

        pitch = Pitch.parseLilypond('disis');
        expect(pitch.pitchClassNumber).to.equal(1);
        expect(pitch.alteration).to.equal(2);

        pitch = Pitch.parseLilypond('d');
        expect(pitch.pitchClassNumber).to.equal(1);
        expect(pitch.alteration).to.equal(0);
    });

    it('should get correct citcle of fifths number', () => {
        expect(new PitchClass(0, 0).circleOf5Number).to.eq(0); // 2a
        expect(new PitchClass(4, 0).circleOf5Number).to.eq(1); // 2a - 7
        expect(new PitchClass(1, 0).circleOf5Number).to.eq(2); // 2a
        expect(new PitchClass(5, 0).circleOf5Number).to.eq(3); // 2a - 7 // (c5 * 4) % 7 = a
        expect(new PitchClass(2, 0).circleOf5Number).to.eq(4); // 2a
        expect(new PitchClass(6, 0).circleOf5Number).to.eq(5); // 2a - 7
        expect(new PitchClass(3, 1).circleOf5Number).to.eq(6);
        expect(new PitchClass(3, 0).circleOf5Number).to.eq(-1);
        expect(new PitchClass(6, -1).circleOf5Number).to.eq(-2);
        expect(new PitchClass(2, -1).circleOf5Number).to.eq(-3);
        expect(new PitchClass(5, -1).circleOf5Number).to.eq(-4);
        expect(new PitchClass(1, -1).circleOf5Number).to.eq(-5);
        expect(new PitchClass(4, -1).circleOf5Number).to.eq(-6);
    });
});