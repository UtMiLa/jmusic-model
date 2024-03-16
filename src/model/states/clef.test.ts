import { ClefType } from './../data-only/states';
import { Time } from './../rationals/time';
import { parseLilyClef, SimpleSequence } from './../score/sequence';
import { Pitch } from '../pitches/pitch';
import { Clef } from './clef';
import { expect } from 'chai';

describe('Clef', () => {
    let clefTreble: Clef, clefAlto: Clef, clefBass: Clef, clefTenor: Clef, clefTenorC: Clef;
    
    beforeEach(() => {
        clefTreble = new Clef({ clefType: ClefType.G, line: -2 });
        clefAlto = new Clef({ clefType: ClefType.C, line: 0 });
        clefBass = new Clef({ clefType: ClefType.F, line: 2 });
        clefTenor = new Clef({ clefType: ClefType.G, line: -2, transpose: -7 });
        clefTenorC = new Clef({ clefType: ClefType.C, line: 2 });
    });

    it('should create a clef object', () => {
        expect(clefTreble).to.exist;
    });

    it('should compare clef objects', () => {
        expect(clefTreble.equals(new Clef({ clefType: ClefType.G, line: -2 }))).to.be.true;
        expect(clefTreble.equals(new Clef({ clefType: ClefType.G, line: -4 }))).to.be.false;
        expect(clefTreble.equals(new Clef({ clefType: ClefType.F, line: -2 }))).to.be.false;
        expect(clefTreble.equals(clefTenor)).to.be.false;
    });

    

    it('should map pitch correctly to line', () => {
        const pitchC4 = new Pitch(0, 4);
        const resTreble = clefTreble.map(pitchC4);
        const resAlto = clefAlto.map(pitchC4);
        const resBass = clefBass.map(pitchC4);
        //const resTenor = clefTenor.map(pitchC4);
        const resTenorC = clefTenorC.map(pitchC4);
        expect(resTreble).to.equal(-6);
        expect(resAlto).to.equal(0);
        expect(resBass).to.equal(6);
        //expect(resTenor).to.equal(1);
        expect(resTenorC).to.equal(2);

        const pitchF3 = new Pitch(3, 3);
        const resBassF = clefBass.map(pitchF3);
        const resAltoF = clefAlto.map(pitchF3);
        expect(resBassF).to.equal(2);
        expect(resAltoF).to.equal(-4);

    });

    it('should map pitch correctly to line when using transpositions', () => {
        const pitchC4 = new Pitch(0, 4);
        const resTenor = clefTenor.map(pitchC4);
        expect(resTenor).to.equal(1);

    });

    it('should map line correctly to pitch when using transpositions', () => {
        const pitchC4 = new Pitch(0, 4);

        const resTenor = clefTenor.mapPosition(1);

        expect(resTenor).to.deep.equal(pitchC4);
    });


    it('should map line correctly to pitch', () => {
        const pitchC4 = new Pitch(0, 4);
        const resTreble = clefTreble.mapPosition(-6);
        const resAlto = clefAlto.mapPosition(0);
        const resBass = clefBass.mapPosition(6);
        //const resTenor = clefTenor.mapPosition(1);
        const resTenorC = clefTenorC.mapPosition(2);
        expect(resTreble).to.deep.equal(pitchC4);
        expect(resAlto).to.deep.equal(pitchC4);
        expect(resBass).to.deep.equal(pitchC4);
        //expect(resTenor).to.deep.equal(pitchC4);
        expect(resTenorC).to.deep.equal(pitchC4);

        const pitchF3 = new Pitch(3, 3);
        const resBassF = clefBass.mapPosition(2);
        const resAltoF = clefAlto.mapPosition(-4);
        expect(resBassF).to.deep.equal(pitchF3);
        expect(resAltoF).to.deep.equal(pitchF3);

    });

    it('should parse a clef change', () => {
        const seq = new SimpleSequence( 'c4 \\clef treble c4' );

        expect(seq.count).to.eq(3);
        expect(seq.elements[1]).to.deep.eq({
            clef: new Clef({
                clefType: ClefType.G,
                line: -2
            }),
            isState: true
        });

        const seq2 = new SimpleSequence( 'c4 \\clef bass c4' );

        expect(seq2.count).to.eq(3);
        expect(seq2.elements[1]).to.deep.eq({
            clef: new Clef({
                clefType: ClefType.F,
                line: 2
            }),
            isState: true
        });

    });


    it('should parse all clef types', () => {
        expect(parseLilyClef('\\clef G')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        expect(parseLilyClef('\\clef treble')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        expect(parseLilyClef('\\clef violin')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        expect(parseLilyClef('\\clef G2')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        //expect(parseLilyClef('\\clef french')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -4 }));
        expect(parseLilyClef('\\clef tenorG')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2, transpose: -7 }));

        //expect(parseLilyClef('\\clef soprano')).to.deep.eq(new Clef({ clefType: ClefType.C, line: -4 }));
        expect(parseLilyClef('\\clef C')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 0 }));
        expect(parseLilyClef('\\clef alto')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 0 }));
        //expect(parseLilyClef('\\clef mezzosoprano')).to.deep.eq(new Clef({ clefType: ClefType.C, line: -2 }));
        //expect(parseLilyClef('\\clef baritone')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 4 }));
        expect(parseLilyClef('\\clef tenor')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 2 }));

        expect(parseLilyClef('\\clef F')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 2 }));
        expect(parseLilyClef('\\clef bass')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 2 }));
        //expect(parseLilyClef('\\clef baritonevarF')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 0 }));
        //expect(parseLilyClef('\\clef varbaritone')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 0 }));
        //expect(parseLilyClef('\\clef subbass')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 4 }));
    });

    it('should parse clefs with transposition', () => {
        expect(parseLilyClef('\\clef G_8')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2, transpose: -7 }));
        expect(parseLilyClef('\\clef C_15')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 0, transpose: -14 }));
        expect(parseLilyClef('\\clef G^8')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2, transpose: 7 }));
        expect(parseLilyClef('\\clef F^15')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 2, transpose: 14 }));
    });

    it('should compare two clefs', () => {
        const clef1 = new Clef({ clefType: ClefType.F, line: -2 });
        const clef2 = new Clef({ clefType: ClefType.F, line: 2 });
        const clef3 = new Clef({ clefType: ClefType.C, line: 2 });
        
        expect(clef1.equals(clef2)).to.be.false;
        expect(clef1.equals(clef3)).to.be.false;
        expect(clef3.equals(clef2)).to.be.false;
        expect(clef3.equals(Clef.clefTenorC)).to.be.true;

    });


});