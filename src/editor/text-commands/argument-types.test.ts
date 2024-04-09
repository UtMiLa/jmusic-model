import { StateChange } from './../../model/states/state';
import { Key, KeyDef, createNoteFromLilypond } from 'model';
import { expect } from 'chai';
import { FixedArg, IntegerArg, KeyArg, NoteArg, RationalArg } from './argument-types';

describe('Argument types', () => {
    describe('Integer', () => {
        it('should provide a regular expression', () => {
            expect(IntegerArg.regex()).to.eq('\\d+');
        });
        it('should parse an integer token', () => {
            expect(IntegerArg.parse('432gyu453')).to.deep.eq([432, 'gyu453']);
        });
    });
    
    describe('Fixed', () => {
        it('should provide a regular expression', () => {
            expect(FixedArg('fixed').regex()).to.eq('fixed');
        });
        it('should parse a fixed token', () => {
            expect(FixedArg('fixed').parse('fixed432')).to.deep.eq(['fixed', '432']);
        });
    });
    

    describe('Rational', () => {
        it('should provide a regular expression', () => {
            expect(RationalArg.regex()).to.eq('\\d+\\/\\d+');
        });
        it('should parse a rational token', () => {
            expect(RationalArg.parse('432/453/')).to.deep.eq([{
                numerator: 432,
                denominator: 453
            }, '/']);
        });
    });

    
    describe('Note', () => {
        it('should provide a regular expression', () => {
            expect(NoteArg.regex()).to.eq('([a-gr](es|is)*[\',]*)(\\d+\\.*)((\\\\[a-z]+)*)(~?)');
        });
        it('should parse a note token', () => {
            expect(NoteArg.parse('eeses4')).to.deep.eq([createNoteFromLilypond('eeses4'), '']);
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
});


