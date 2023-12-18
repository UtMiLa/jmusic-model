import { TimeSpan } from '../rationals/time';
import { Time } from '../rationals/time';
import { expect } from 'chai';
import { getDuration, parseLilyElement } from '../score/sequence';

describe('Spacer', () => {
    
    it('should parse a note from Lilypond format', () => {
        const note = parseLilyElement('s4');
        expect((note as any).pitches).to.be.undefined;
        expect(getDuration(note)).to.deep.eq(Time.newSpan(1, 4));

        const note2 = parseLilyElement('\\skip2.');
        expect((note2 as any).pitches).to.be.undefined;
        expect(getDuration(note2)).to.deep.eq(Time.newSpan(3, 4));
    });

});