import { StateChange } from './../../model/states/state';
import { Clef, ClefType, Key, MeterFactory, Pitch, PitchClass, createNoteFromLilypond } from 'model';
import { expect } from 'chai';
import { ClefArg, KeyArg, MeterArg, NoteArg, SpacerArg,  PitchClassArg, PitchArg } from './argument-types';
import { RationalArg } from './base-argument-types';
import { createSpacerFromLilypond } from '../../model/notes/spacer';

describe('Argument types', () => {
        
    describe('Pitch class', () => {
        it('should provide a regular expression', () => {
            expect(PitchClassArg.regex()).to.eq('[a-g](es|is)*');
        });
        it('should parse a pitch class token', () => {
            expect(PitchClassArg.parse('eeses,,')).to.deep.eq([new PitchClass(2, -2), ',,']);
        });
        it('should fail on an illegal pitch class', () => {
            expect(() => PitchClassArg.parse('jes,,')).to.throw(/Illegal pitch class/);
        });
    });
    
    describe('Pitch', () => {
        it('should provide a regular expression', () => {
            expect(PitchArg.regex()).to.eq('([a-g](es|is)*)([\',]*)');
        });
        it('should parse a pitch token', () => {
            expect(PitchArg.parse('eeses,,4')).to.deep.eq([new Pitch(2, 1, -2), '4']);
        });
        it('should fail on an illegal pitch', () => {
            expect(() => PitchArg.parse('jes,,')).to.throw(/Illegal pitch/);
        });
    });
    
    describe('Note', () => {
        it('should provide a regular expression', () => {
            expect(NoteArg.regex()).to.eq(/((([a-g](es|is)*)([',]*))|((<)((([a-g](es|is)*)([',]*)\s*)+)(>))|(r))((\d+)((\.)*))((\\[a-z]+\s*)*)((~)?)/.source);
        });
        it('should parse a note token', () => {
            expect(NoteArg.parse('eeses\'\'4')).to.deep.eq([createNoteFromLilypond('eeses\'\'4'), '']);
        });
    });

    describe('Rest', () => {
        it('should parse a rest token', () => {
            expect(NoteArg.parse('r4')).to.deep.eq([createNoteFromLilypond('r4'), '']);
        });
    });

    describe('Spacer', () => {
        it('should parse a spacer token', () => {
            expect(SpacerArg.parse('s4')).to.deep.eq([createSpacerFromLilypond('s4'), '']);
        });
    });

    describe('Key change', () => {
        it('should provide a regular expression', () => {
            expect(KeyArg.regex()).to.eq('(\\d+)((#)|(b))');
        });
        it('should parse a key token', () => {
            const res = KeyArg.parse('3b');
            expect(res).to.deep.eq([
                StateChange.newKeyChange(new Key({ accidental: -1, count: 3 })),                 
                ''
            ]);
        });
    });
    describe('Meter change', () => {
        it('should provide a regular expression', () => {
            expect(MeterArg.regex()).to.eq(RationalArg.regex());
        });
        it('should parse a meter token', () => {
            const res = MeterArg.parse('3/4');
            expect(res).to.deep.eq([
                StateChange.newMeterChange(MeterFactory.createRegularMeter({ value: 4, count: 3 })),                 
                ''
            ]);
        });
    });
    describe('Clef change', () => {
        it('should provide a regular expression', () => {
            expect(ClefArg.regex()).to.eq('(\\\\clef )(\\w+)');
        });
        it('should parse a clef token', () => {
            const res = ClefArg.parse('\\clef treble');
            expect(res).to.deep.eq([
                StateChange.newClefChange(new Clef({ clefType: ClefType.G, line: -2 })),
                ''
            ]);
        });
    });
});


