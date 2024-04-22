import { either } from 'fp-ts';
import { KeyDef, createNoteFromLilypond } from 'model';
import { expect } from 'chai';
import { FixedArg, IntegerArg, RationalArg, WhitespaceArg } from './base-argument-types';
import { KeyArg, NoteArg } from './argument-types';
import { many, mapResult, optional, select, sequence } from './argument-modifiers';

//const IntegerArg = _eitherToException(Int0Arg);

//const WhitespaceArg = _eitherToException(W0);

//const RationalArg = _eitherToException(R0);
//const optional = (type: any) => _eitherToException(op0(type));

describe('Argument type modifiers', () => {
    describe('Many', () => {
        /*it('should provide a regular expression for many integers', () => {
            expect(many(IntegerArg).regex()).to.eq('(\\d+\\s*)+');
        });*/
        it('should parse an integer array', () => {
            expect(many((IntegerArg))('4 63 43 52 ijo 54')).to.deep.eq(either.right([[4, 63, 43, 52], 'ijo 54']));
        });        
        it('should parse an empty array', () => {
            expect(many((IntegerArg))('e4 63 43 52 ijo 54')).to.deep.eq(either.right([[], 'e4 63 43 52 ijo 54']));
        });
        it('should parse a rational array', () => {
            expect(many((RationalArg))('4/5 63/41 43 52 ijo 54')).to.deep.eq(either.right([[
                {
                    numerator: 4,
                    denominator: 5
                },{
                    numerator: 63,
                    denominator: 41
                }
            ], '43 52 ijo 54'])
            );
        });

        it('should parse a note sequence', () => {
            expect(many((NoteArg))('ees4 f4 ges2. aes4')).to.deep.eq(either.right([[
                createNoteFromLilypond('ees4'),
                createNoteFromLilypond('f4'),
                createNoteFromLilypond('ges2.'),
                createNoteFromLilypond('aes4')
            ], '']));
        });

    });
   
    describe('Optional', () => {
        /*it('should provide a regular expression for an optional integer', () => {
            expect(optional(IntegerArg).regex()).to.eq('(\\d+)?');
        });*/
        it('should parse an optional integer', () => {
            expect(optional(IntegerArg)('4 63 ijo')).to.deep.eq(either.right([4, ' 63 ijo']));
        });        
        it('should parse an empty optional', () => {
            expect(optional(IntegerArg)('e4 63 43 52 ijo 54')).to.deep.eq(either.right([null, 'e4 63 43 52 ijo 54']));
        });
        it('should accept optional keywords in string form', () => {
            expect(optional('hej')('e4 63 43 52 ijo 54')).to.deep.eq(either.right([undefined, 'e4 63 43 52 ijo 54']));
            expect(optional('hej')('hej 63 43 52 ijo 54')).to.deep.eq(either.right([undefined, ' 63 43 52 ijo 54']));
        });
        it('should accept optional whitespace', () => {
            expect(optional(WhitespaceArg)('63 43 52 ijo 54')).to.deep.eq(either.right([undefined, '63 43 52 ijo 54']));
            expect(optional(WhitespaceArg)('\t 63 43 52 ijo 54')).to.deep.eq(either.right([undefined, '63 43 52 ijo 54']));
        });
        it('should parse an optional rational', () => {
            expect(optional(RationalArg)('4/5 63/41 43 52 ijo 54')).to.deep.eq(either.right([
                {
                    numerator: 4,
                    denominator: 5
                }, 
                ' 63/41 43 52 ijo 54']
            ));
        });
    });

    
    describe('Sequence', () => {
        it('should parse a sequence', () => {
            expect(sequence([IntegerArg, (FixedArg(' = ')), RationalArg])('4 = 63/43 52 ijo 54'))
                .to.deep.eq(either.right([[4, ' = ', {
                    numerator: 63,
                    denominator: 43
                }], ' 52 ijo 54']));
        });
        it('should parse a sequence with string keywords', () => {
            expect(sequence([IntegerArg, '=', IntegerArg])('4=63 52 ijo 54'))
                .to.deep.eq(either.right([[4, 63], ' 52 ijo 54']));
        });   
        
        it('should parse a sequence with regex keywords', () => {
            expect(sequence([IntegerArg, /=/, IntegerArg])('4=63 52 ijo 54'))
                .to.deep.eq(either.right([[4, 63], ' 52 ijo 54']));
        });   
        it('should fail an unmatched sequence', () => {
            expect(sequence([IntegerArg, (FixedArg(' = ')), RationalArg])('4 = 63/h43 52 ijo 54'))
                .to.deep.eq(either.left('Not a rational'));
            
        });
        it('should filter out keywords and whitespace', () => {
            expect(sequence([IntegerArg, ' =', WhitespaceArg, IntegerArg])('4 = 63 52 ijo 54'))
                .to.deep.eq(either.right([[4, 63], ' 52 ijo 54']));            
        });
        it('should filter out optional keywords when present', () => {
            expect(sequence([IntegerArg, optional(' ='), WhitespaceArg, IntegerArg])('4 = 63 52 ijo 54'))
                .to.deep.eq(either.right([[4, 63], ' 52 ijo 54']));            
        });
        it('should filter out optional keywords when not present', () => {
            expect(sequence([IntegerArg, optional(' ='), WhitespaceArg, IntegerArg])('4 63 52 ijo 54'))
                .to.deep.eq(either.right([[4, 63], ' 52 ijo 54']));            
        });
        it('should not filter out optional values when present', () => {
            expect(sequence([IntegerArg, WhitespaceArg, optional(IntegerArg), 'end'])('4 53end 63 52'))
                .to.deep.eq(either.right([[4, 53], ' 63 52']));
        });
        it('should not filter out optional values when not present', () => {
            expect(sequence([IntegerArg, WhitespaceArg, optional(IntegerArg), 'end'])('4 end 63 52'))
                .to.deep.eq(either.right([[4, null], ' 63 52']));
        });
        it('should fail a sequence with unmatched string keywords', () => {
            expect(sequence([IntegerArg, '=', IntegerArg])('4 63 52 ijo 54'))
                .to.deep.eq(either.left('Missing keyword'));
        });   
    });





    describe('Select', () => {
        it('should parse integers', () => { // todo: it should warn if more than one path matches the string
            expect(select([RationalArg, IntegerArg])('4'))
                .to.deep.eq(either.right([4, '']));
        });
        it('should parse rationals', () => {
            expect(select([RationalArg, IntegerArg])('4/5'))
                .to.deep.eq(either.right([{
                    numerator: 4,
                    denominator: 5
                }, '']));
        });
        it('should parse whitespace', () => {
            expect(select([IntegerArg, WhitespaceArg])('\t'))
                .to.deep.eq(either.right([undefined, '']));
        });
        it('should fail an unmatched select', () => {
            expect(select([RationalArg, IntegerArg])('= 63/43'))
                .to.deep.eq(either.left('Syntax error'));
            
        });
    });

   
    describe('MapResult', () => {
        /*it('should provide the same regular expression as the child', () => {
            expect(mapResult(RationalArg, rat => rat.numerator).regex()).to.eq(RationalArg.regex());
        });*/
        it('should map a parsed integer', () => {
            expect(mapResult((IntegerArg), int => `${int}: ${int * int}`)('4 ='))
                .to.deep.eq(either.right(['4: 16', ' =']));
        });
    });

});