import { expect } from 'chai';
import { addInterval, diffPitch, Enharmonic, enharmonicChange, Interval } from './intervals';
import { Pitch, PitchClass } from './pitch';
describe('Intervals', () => {
    let pc: Pitch, pd: Pitch, pb: Pitch, pe: Pitch;
    beforeEach(() => { 
        pc = Pitch.parseScientific('c4');
        pd = Pitch.parseScientific('d5');
        pb = Pitch.parseScientific('b1');
        pe = Pitch.parseScientific('e3');
    });

    function expectPitchDiff(pitch1: string, pitch2: string, interval: Interval){
        expect(diffPitch(Pitch.parseLilypond(pitch2), Pitch.parseLilypond(pitch1)), `${pitch1} - ${pitch2}`).to.deep.equal(interval);
    }

    it('should calculate interval between two pitches', () => {
        expectPitchDiff('c', 'c', { interval: 0, alteration: 0 });
        expectPitchDiff('c', 'f', { interval: 3, alteration: 0 });
        expectPitchDiff('c', 'gis', { interval: 4, alteration: 2 });
        expectPitchDiff('c', 'cis', { interval: 0, alteration: 2 });
        expectPitchDiff('cis', 'cis', { interval: 0, alteration: 0 });
        expectPitchDiff('cis', 'f', { interval: 3, alteration: -2 });
        expectPitchDiff('cis', 'gis', { interval: 4, alteration: 0 });
        expectPitchDiff('cis', 'ges', { interval: 4, alteration: -3 });

        expectPitchDiff('c', 'd', { interval: 1, alteration: 1 });
        expectPitchDiff('e', 'f', { interval: 1, alteration: -1 });
        expectPitchDiff('ees', 'fis', { interval: 1, alteration: 2 });
        expectPitchDiff('d', 'b', { interval: 5, alteration: 1 });
        expectPitchDiff('d', 'bes', { interval: 5, alteration: -1 });
    });

    function expectAddInterval(pitch1: string, pitch2: string, interval: Interval){
        expect(addInterval(Pitch.parseLilypond(pitch1), interval), `${pitch1} - ${interval.interval}/${interval.alteration}`).to.deep.equal(Pitch.parseLilypond(pitch2));
    }


    it('should add an interval to a pitch', () => {
        expectAddInterval('c', 'c', { interval: 0, alteration: 0 });
        expectAddInterval('c', 'f', { interval: 3, alteration: 0 });
        expectAddInterval('c', 'gis', { interval: 4, alteration: 2 });
        expectAddInterval('c', 'cis', { interval: 0, alteration: 2 });
        expectAddInterval('cis', 'cis', { interval: 0, alteration: 0 });
        expectAddInterval('cis', 'f', { interval: 3, alteration: -2 });
        expectAddInterval('cis', 'gis', { interval: 4, alteration: 0 });
        expectAddInterval('cis', 'ges', { interval: 4, alteration: -3 });

        expectAddInterval('c', 'd', { interval: 1, alteration: 1 });
        expectAddInterval('e', 'f', { interval: 1, alteration: -1 });
        expectAddInterval('ees', 'fis', { interval: 1, alteration: 2 });
        expectAddInterval('d', 'b', { interval: 5, alteration: 1 });
        expectAddInterval('d', 'bes', { interval: 5, alteration: -1 });
    });

    it('should handle octaves correctly when finding intervals between pitches', () => {
        expectPitchDiff('c', 'c\'', { interval: 7, alteration: 0 });
        expectPitchDiff('c', 'c\'\'', { interval: 14, alteration: 0 });
        expectPitchDiff('c', 'c,', { interval: -7, alteration: 0 });
        expectPitchDiff('c', 'c,,', { interval: -14, alteration: 0 });
        expectPitchDiff('c', 'b,', { interval: -1, alteration: 1 });
        expectPitchDiff('a', 'c\'', { interval: 2, alteration: -1 });
        expectPitchDiff('a', 'b', { interval: 1, alteration: 1 });
        expectPitchDiff('a', 'cis\'', { interval: 2, alteration: 1 });
        expectPitchDiff('a', 'b,', { interval: -6, alteration: 1 });
        expectPitchDiff('bis,', 'ces', { interval: 1, alteration: -3 });
    });

    it('should handle octaves correctly when adding intervals', () => {
        expectAddInterval('c', 'c\'', { interval: 7, alteration: 0 });
        expectAddInterval('c', 'c\'\'', { interval: 14, alteration: 0 });
        expectAddInterval('c', 'c,', { interval: -7, alteration: 0 });
        expectAddInterval('c', 'c,,', { interval: -14, alteration: 0 });
        expectAddInterval('c', 'b,', { interval: -1, alteration: 1 });
        expectAddInterval('a', 'c\'', { interval: 2, alteration: -1 });
        expectAddInterval('a', 'b', { interval: 1, alteration: 1 });
        expectAddInterval('a', 'cis\'', { interval: 2, alteration: 1 });
        expectAddInterval('a', 'b,', { interval: -6, alteration: 1 });
        expectAddInterval('bis,', 'ces', { interval: 1, alteration: -3 });
    });

    
    it('should change a pitch enharmonically', () => {
        expect(enharmonicChange(Pitch.parseLilypond('c\''), Enharmonic.Sharpen)).to.deep.eq(Pitch.parseLilypond('bis'));
        expect(enharmonicChange(Pitch.parseLilypond('c\''), Enharmonic.Flatten)).to.deep.eq(Pitch.parseLilypond('deses\''));
        expect(enharmonicChange(Pitch.parseLilypond('c\''), Enharmonic.BestBet)).to.deep.eq(Pitch.parseLilypond('bis'));
        expect(enharmonicChange(Pitch.parseLilypond('b\''), Enharmonic.Sharpen)).to.deep.eq(Pitch.parseLilypond('aisis\''));
        expect(enharmonicChange(Pitch.parseLilypond('b\''), Enharmonic.Flatten)).to.deep.eq(Pitch.parseLilypond('ces\'\''));
        expect(enharmonicChange(Pitch.parseLilypond('b\''), Enharmonic.BestBet)).to.deep.eq(Pitch.parseLilypond('ces\'\''));
        expect(enharmonicChange(Pitch.parseLilypond('a'), Enharmonic.Sharpen)).to.deep.eq(Pitch.parseLilypond('gisis'));
        expect(enharmonicChange(Pitch.parseLilypond('a'), Enharmonic.Flatten)).to.deep.eq(Pitch.parseLilypond('beses'));
        expect(enharmonicChange(Pitch.parseLilypond('a'), Enharmonic.BestBet)).to.deep.eq(Pitch.parseLilypond('beses'));
        expect(enharmonicChange(Pitch.parseLilypond('g'), Enharmonic.Sharpen)).to.deep.eq(Pitch.parseLilypond('fisis'));
        expect(enharmonicChange(Pitch.parseLilypond('g'), Enharmonic.Flatten)).to.deep.eq(Pitch.parseLilypond('aeses'));
        expect(enharmonicChange(Pitch.parseLilypond('g'), Enharmonic.BestBet)).to.deep.eq(Pitch.parseLilypond('fisis'));
        expect(enharmonicChange(Pitch.parseLilypond('d'), Enharmonic.BestBet)).to.deep.eq(Pitch.parseLilypond('cisis'));
    });
});