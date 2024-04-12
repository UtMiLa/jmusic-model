import { KeyDef, createNoteFromLilypond } from 'model';
import { expect } from 'chai';
import { FixedArg, IntegerArg, RationalArg, WhitespaceArg } from './base-argument-types';
import { KeyArg, NoteArg } from './argument-types';
import { many, mapResult, optional, select, sequence } from './argument-modifiers';


describe('Argument type modifiers', () => {
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
   
    describe('Optional', () => {
        it('should provide a regular expression for an optional integer', () => {
            expect(optional(IntegerArg).regex()).to.eq('(\\d+)?');
        });
        it('should parse an optional integer', () => {
            expect(optional(IntegerArg).parse('4 63 ijo')).to.deep.eq([4, ' 63 ijo']);
        });        
        it('should parse an empty optional', () => {
            expect(optional(IntegerArg).parse('e4 63 43 52 ijo 54')).to.deep.eq([null, 'e4 63 43 52 ijo 54']);
        });
        it('should accept optional keywords in string form', () => {
            expect(optional('hej').parse('e4 63 43 52 ijo 54')).to.deep.eq([undefined, 'e4 63 43 52 ijo 54']);
            expect(optional('hej').parse('hej 63 43 52 ijo 54')).to.deep.eq([undefined, ' 63 43 52 ijo 54']);
        });
        it('should accept optional whitespace', () => {
            expect(optional(WhitespaceArg).parse('63 43 52 ijo 54')).to.deep.eq([undefined, '63 43 52 ijo 54']);
            expect(optional(WhitespaceArg).parse('\t 63 43 52 ijo 54')).to.deep.eq([undefined, '63 43 52 ijo 54']);
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
        it('should parse a sequence with string keywords', () => {
            expect(sequence([IntegerArg, '=', IntegerArg])
                .parse('4=63 52 ijo 54'))
                .to.deep.eq([[4, 63], ' 52 ijo 54']);
        });   
        it('should fail an unmatched sequence', () => {
            expect(() => sequence([IntegerArg, FixedArg(' = '), RationalArg])
                .parse('4 = 63/h43 52 ijo 54'))
                .to.throw(/Not a rational/);
            
        });
        it('should filter out keywords and whitespace', () => {
            expect(sequence([IntegerArg, ' =', WhitespaceArg, IntegerArg])
                .parse('4 = 63 52 ijo 54'))
                .to.deep.eq([[4, 63], ' 52 ijo 54']);            
        });
        it('should filter out optional keywords when present', () => {
            expect(sequence([IntegerArg, optional(' ='), WhitespaceArg, IntegerArg])
                .parse('4 = 63 52 ijo 54'))
                .to.deep.eq([[4, 63], ' 52 ijo 54']);            
        });
        it('should filter out optional keywords when not present', () => {
            expect(sequence([IntegerArg, optional(' ='), WhitespaceArg, IntegerArg])
                .parse('4 63 52 ijo 54'))
                .to.deep.eq([[4, 63], ' 52 ijo 54']);            
        });
        it('should not filter out optional values when present', () => {
            expect(sequence([IntegerArg, WhitespaceArg, optional(IntegerArg), 'end'])
                .parse('4 53end 63 52'))
                .to.deep.eq([[4, 53], ' 63 52']);            
        });
        it('should not filter out optional values when not present', () => {
            expect(sequence([IntegerArg, WhitespaceArg, optional(IntegerArg), 'end'])
                .parse('4 end 63 52'))
                .to.deep.eq([[4, null], ' 63 52']);            
        });
        it('should fail a sequence with unmatched string keywords', () => {
            expect(() => sequence([IntegerArg, '=', IntegerArg])
                .parse('4 63 52 ijo 54'))
                .to.throw(/Missing keyword/);
        });   
    });





    describe('Select', () => {
        it('should provide a regular expression for integer/rational selections', () => {
            expect(select([RationalArg, IntegerArg]).regex()).to.eq('(\\d+\\/\\d+)|(\\d+)');
        });
        it('should parse integers', () => { // todo: it should warn if more than one path matches the string
            expect(select([RationalArg, IntegerArg])
                .parse('4'))
                .to.deep.eq([4, '']);
        });
        it('should parse rationals', () => {
            expect(select([RationalArg, IntegerArg])
                .parse('4/5'))
                .to.deep.eq([{
                    numerator: 4,
                    denominator: 5
                }, '']);
        });
        it('should parse whitespace', () => {
            expect(select([IntegerArg, WhitespaceArg])
                .parse('\t'))
                .to.deep.eq([undefined, '']);
        });
        it('should fail an unmatched select', () => {
            expect(() => select([RationalArg, IntegerArg])
                .parse('= 63/43'))
                .to.throw(/Syntax error/);
            
        });
    });

    
    describe('MapResult', () => {
        it('should provide the same regular expression as the child', () => {
            expect(mapResult(RationalArg, rat => rat.numerator).regex()).to.eq(RationalArg.regex());
        });
        it('should map a parsed integer', () => {
            expect(mapResult(IntegerArg, int => `${int}: ${int * int}`)
                .parse('4 ='))
                .to.deep.eq(['4: 16', ' =']);
        });
    });

});