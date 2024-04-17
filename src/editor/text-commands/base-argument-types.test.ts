import { expect } from 'chai';
import { FixedArg, IntegerArg, RationalArg, WhitespaceArg as WhitespaceArg, WordArg } from './base-argument-types';

describe('Argument types', () => {
    describe('Integer', () => {
        /*it('should provide a regular expression', () => {
            expect(IntegerArg.regex()).to.eq('\\d+');
        });*/
        it('should parse an integer token', () => {
            expect(IntegerArg('432gyu453')).to.deep.eq([432, 'gyu453']);
        });
    });
    describe('Whitespace', () => {
        /*it('should provide a regular expression', () => {
            expect(WhitespaceArg.regex()).to.eq('\\s+');
        });*/
        it('should parse a whitespace token', () => {
            expect(WhitespaceArg('\t \r\ngyu453')).to.deep.eq([undefined, 'gyu453']);
        });
    });
    describe('Word', () => {
        /*it('should provide a regular expression', () => {
            expect(WordArg.regex()).to.eq('\\w+');
        });*/
        it('should parse a word token', () => {
            expect(WordArg('432gyu453 huio')).to.deep.eq(['432gyu453', ' huio']);
        });
    });
    
    describe('Fixed', () => {
        /*it('should provide a regular expression', () => {
            expect(FixedArg('fixed').regex()).to.eq('fixed');
        });*/
        it('should parse a fixed token', () => {
            expect(FixedArg('fixed')('fixed432')).to.deep.eq(['fixed', '432']);
        });
    });
    

    describe('Rational', () => {
        /*it('should provide a regular expression', () => {
            expect(RationalArg.regex()).to.eq('\\d+\\/\\d+');
        });*/
        it('should parse a rational token', () => {
            expect(RationalArg('432/453/')).to.deep.eq([{
                numerator: 432,
                denominator: 453
            }, '/']);
        });
    });

});