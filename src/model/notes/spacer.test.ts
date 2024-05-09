import { TimeSpan } from '../rationals/time';
import { Time } from '../rationals/time';
import { expect } from 'chai';
import { getDuration, parseLilyElement } from '../score/sequence';
import { Spacer, spacerAsLilypond } from './spacer';

describe('Spacer', () => {
    
    it('should parse a spacer from Lilypond format', () => {
        const note = parseLilyElement('s4');
        expect((note as any).pitches).to.be.undefined;
        expect(getDuration(note)).to.deep.eq(Time.newSpan(1, 4));

        const note2 = parseLilyElement('\\skip2.');
        expect((note2 as any).pitches).to.be.undefined;
        expect(getDuration(note2)).to.deep.eq(Time.newSpan(3, 4));
    });

    it('should parse a rational timed spacer from Lilypond format', () => {
        const note = parseLilyElement('s1*29/16');
        expect((note as any).pitches).to.be.undefined;
        expect(getDuration(note)).to.deep.eq(Time.newSpan(29, 16));
    });

    it('should convert a spacer to Lilypond format', () => {
        const spacer = { type: 'spacer', duration: Time.newSpan(29, 16) } as Spacer;
        expect(spacerAsLilypond(spacer)).to.deep.eq('s1*29/16');
    });

});