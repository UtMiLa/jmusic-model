import { createNoteFromLilypond } from 'model';
import { expect } from 'chai';
import { FixedArg, IntegerArg, NoteArg, RationalArg, many, optional, sequence } from './argument-types';

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

    
    describe('Many', () => {
        it('should provide a regular expression for many integers', () => {
            expect(many(IntegerArg).regex()).to.eq('(\\d+ *)+');
        });
        it('should parse an integer array', () => {
            expect(many(IntegerArg).parse('4 63 43 52 ijo 54')).to.deep.eq([[4, 63, 43, 52], 'ijo 54']);
        });        
        it('should parse an empty array', () => {
            expect(many(IntegerArg).parse('e4 63 43 52 ijo 54')).to.deep.eq([[], 'e4 63 43 52 ijo 54']);
        });
        it('should parse a rational array', () => {
            expect(many(RationalArg).parse('4/5 63/41 43 52 ijo 54')).to.deep.eq([[
                {
                    numerator: 4,
                    denominator: 5
                },{
                    numerator: 63,
                    denominator: 41
                }
            ], '43 52 ijo 54']
            );
        });

        it('should parse a note sequence', () => {
            expect(many(NoteArg).parse('ees4 f4 ges2. aes4')).to.deep.eq([[
                createNoteFromLilypond('ees4'),
                createNoteFromLilypond('f4'),
                createNoteFromLilypond('ges2.'),
                createNoteFromLilypond('aes4')
            ], '']);
        });

    });
   
    describe('Option', () => {
        it('should provide a regular expression for an optional integer', () => {
            expect(optional(IntegerArg).regex()).to.eq('(\\d+)?');
        });
        it('should parse an optional integer', () => {
            expect(optional(IntegerArg).parse('4 63 ijo')).to.deep.eq([4, ' 63 ijo']);
        });        
        it('should parse an empty optional', () => {
            expect(optional(IntegerArg).parse('e4 63 43 52 ijo 54')).to.deep.eq([null, 'e4 63 43 52 ijo 54']);
        });
        it('should parse an optional rational', () => {
            expect(optional(RationalArg).parse('4/5 63/41 43 52 ijo 54')).to.deep.eq([
                {
                    numerator: 4,
                    denominator: 5
                }, 
                ' 63/41 43 52 ijo 54']
            );
        });
    });



    describe('Sequence', () => {
        it('should provide a regular expression for many integers', () => {
            expect(sequence([IntegerArg, RationalArg]).regex()).to.eq('(\\d+)(\\d+\\/\\d+)');
        });
        it('should parse a sequence', () => {
            expect(sequence([IntegerArg, FixedArg(' = '), RationalArg])
                .parse('4 = 63/43 52 ijo 54'))
                .to.deep.eq([[4, ' = ', {
                    numerator: 63,
                    denominator: 43
                }], ' 52 ijo 54']);
        });        
        it('should fail an unmatched sequence', () => {
            expect(() => sequence([IntegerArg, FixedArg(' = '), RationalArg])
                .parse('4 = 63/h43 52 ijo 54'))
                .to.throw(/Not a rational/);
            
        });
    });
});