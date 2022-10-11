import { Time } from './../rationals/time';
import { Sequence, __internal } from './../score/sequence';
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

    it('should parse a clef change', () => {
        const seq = new Sequence({ elements: 'c4 \\clef treble c4' });

        expect(seq.count).to.eq(3);
        expect(seq.elements[1]).to.deep.eq({
            clef: new Clef({
                clefType: ClefType.G,
                line: -2
            }),
            duration: Time.newSpan(0, 1),
            isState: true
        });

        const seq2 = new Sequence({ elements: 'c4 \\clef bass c4' });

        expect(seq2.count).to.eq(3);
        expect(seq2.elements[1]).to.deep.eq({
            clef: new Clef({
                clefType: ClefType.F,
                line: 2
            }),
            duration: Time.newSpan(0, 1),
            isState: true
        });

    });


    it('should parse all clef types', () => {
        expect(__internal.parseLilyClef('\\clef G')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        expect(__internal.parseLilyClef('\\clef treble')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        expect(__internal.parseLilyClef('\\clef violin')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        expect(__internal.parseLilyClef('\\clef G2')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -2 }));
        //expect(__internal.parseLilyClef('\\clef french')).to.deep.eq(new Clef({ clefType: ClefType.G, line: -4 }));
        expect(__internal.parseLilyClef('\\clef tenorG')).to.deep.eq(new Clef({ clefType: ClefType.G8, line: -2 }));

        //expect(__internal.parseLilyClef('\\clef soprano')).to.deep.eq(new Clef({ clefType: ClefType.C, line: -4 }));
        expect(__internal.parseLilyClef('\\clef C')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 0 }));
        expect(__internal.parseLilyClef('\\clef alto')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 0 }));
        //expect(__internal.parseLilyClef('\\clef mezzosoprano')).to.deep.eq(new Clef({ clefType: ClefType.C, line: -2 }));
        //expect(__internal.parseLilyClef('\\clef baritone')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 4 }));
        expect(__internal.parseLilyClef('\\clef tenor')).to.deep.eq(new Clef({ clefType: ClefType.C, line: 2 }));

        expect(__internal.parseLilyClef('\\clef F')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 2 }));
        expect(__internal.parseLilyClef('\\clef bass')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 2 }));
        //expect(__internal.parseLilyClef('\\clef baritonevarF')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 0 }));
        //expect(__internal.parseLilyClef('\\clef varbaritone')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 0 }));
        //expect(__internal.parseLilyClef('\\clef subbass')).to.deep.eq(new Clef({ clefType: ClefType.F, line: 4 }));
    });



});