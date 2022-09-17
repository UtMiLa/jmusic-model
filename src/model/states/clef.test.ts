import { Pitch } from '../pitches/pitch';
import { Clef, ClefType } from './clef';
import { expect } from 'chai';

describe('Clef', () => {
    let clefTreble: Clef, clefAlto: Clef, clefBass: Clef, clefTenor: Clef, clefTenorC: Clef;
    
    beforeEach(() => {
        clefTreble = new Clef({ clefType: ClefType.G, line: -2 });
        clefAlto = new Clef({ clefType: ClefType.C, line: 0 });
        clefBass = new Clef({ clefType: ClefType.F, line: 2 });
        clefTenor = new Clef({ clefType: ClefType.G8, line: -2 });
        clefTenorC = new Clef({ clefType: ClefType.C, line: 2 });
    });

    it('should create a clef object', () => {
        expect(clefTreble).to.exist;
    });

    it('should map pitch correctly to line', () => {
        const pitchC4 = new Pitch(0, 4);
        const resTreble = clefTreble.map(pitchC4);
        const resAlto = clefAlto.map(pitchC4);
        const resBass = clefBass.map(pitchC4);
        const resTenor = clefTenor.map(pitchC4);
        const resTenorC = clefTenorC.map(pitchC4);
        expect(resTreble).to.equal(-6);
        expect(resAlto).to.equal(0);
        expect(resBass).to.equal(6);
        expect(resTenor).to.equal(1);
        expect(resTenorC).to.equal(2);

        const pitchF3 = new Pitch(3, 3);
        const resBassF = clefBass.map(pitchF3);
        const resAltoF = clefAlto.map(pitchF3);
        expect(resBassF).to.equal(2);
        expect(resAltoF).to.equal(-4);

    });

});