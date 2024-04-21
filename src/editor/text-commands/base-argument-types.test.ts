import { expect } from 'chai';
import { FixedArg, IntegerArg, RationalArg, WhitespaceArg as WhitespaceArg, WordArg, _eitherToException } from './base-argument-types';
import { either } from 'fp-ts';

describe('Argument types', () => {
    describe('Integer', () => {
        it('should parse an integer token', () => {
            expect(IntegerArg('432gyu453')).to.deep.eq(either.right([432, 'gyu453']));
        });
        it('should parse an erroneous integer token', () => {
            expect(IntegerArg('f432gyu453')).to.deep.eq(either.left('Not an integer'));
        });
    });
    describe('Whitespace', () => {
        it('should parse a whitespace token', () => {
            expect(WhitespaceArg('\t \r\ngyu453')).to.deep.eq(either.right([undefined, 'gyu453']));
        });
    });
    describe('Word', () => {
        /*it('should provide a regular expression', () => {
            expect(WordArg.regex()).to.eq('\\w+');
        });*/
        it('should parse a word token', () => {
            expect(WordArg('432gyu453 huio')).to.deep.eq(either.right(['432gyu453', ' huio']));
        });
    });
    
    describe('Fixed', () => {
        it('should parse a fixed token', () => {
            expect(FixedArg('fixed')('fixed432')).to.deep.eq(either.right(['fixed', '432']));
        });
        it('should parse a fixed token with special regex characters', () => {
            expect(FixedArg('fix.?ed')('fix.?ed432')).to.deep.eq(either.right(['fix.?ed', '432']));
        });
        it('should parse a fixed token with special regex characters not at beginning', () => {
            expect(FixedArg('fix.?ed')(' fix.?ed432')).to.deep.eq(either.left('Not a match'));
        });
        it('should parse a regex', () => {
            expect(FixedArg(/fix.?ed/)('fixed432')).to.deep.eq(either.right(['fixed', '432']));
            expect(FixedArg(/fix.?ed/)('fixXed432')).to.deep.eq(either.right(['fixXed', '432']));
        });
        it('should parse a regex not at beginning', () => {
            expect(FixedArg(/fix.?ed/)(' fixXed432')).to.deep.eq(either.left('Not a match in correct position'));
        });
    });
    

    describe('Rational', () => {
        it('should parse a rational token', () => {
            expect(RationalArg('432/453/')).to.deep.eq(either.right([{
                numerator: 432,
                denominator: 453
            }, '/']));
        });
        it('should parse a failing rational token', () => {
            expect(RationalArg('4:453/43')).to.deep.eq(either.left('Not a rational'));
        });
    });

});