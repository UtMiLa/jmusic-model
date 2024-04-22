import { either, eitherT } from 'fp-ts';
import { RationalDef } from '../../model';
import { left } from 'fp-ts/lib/EitherT';
import { Either } from 'fp-ts/lib/Either';
import {  } from 'fp-ts/lib/Tuple';

export function regexEscape(s: string): string { // taken from sanctuary.js
    return s.replace (/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export interface ArgType<T> {
    (input: string): Either<string, [T, string]>;
    undefinedWhenOptional?: boolean;
}


export function matches<T>(argt: ArgType<T>, input: string): boolean {
    const arg = argt;
    const v = arg(input);
    return either.isRight(v);
}

export const FixedArg = (arg: string | RegExp): ArgType<string> => (input: string) => {
    const m = (arg instanceof RegExp ? arg : new RegExp('^' + regexEscape(arg))).exec(input);
    if (!m) return either.left('Not a match');
    //if (!m) throw 'Not a match';
    if (input.indexOf(m[0]) !== 0) return either.left('Not a match in correct position');
    //if (input.indexOf(m[0]) !== 0) throw 'Not a match in correct position';
    const rest = input.substring(m[0].length);
    return either.right([m[0], rest]);
};

export const IntegerArg: ArgType<number> = (input: string) => {
    const m = /^\d+/.exec(input);
    if (!m) return either.left('Not an integer');
    const rest = input.substring(m[0].length);
    return either.right([parseInt(m[0]), rest]);
};

export const WhitespaceArg: ArgType<undefined> = (input: string) => {
    const m = /^\s+/.exec(input);
    if (!m) return either.left('Not a whitespace');
    const rest = input.substring(m[0].length);
    return either.right([undefined, rest]);
};
WhitespaceArg.undefinedWhenOptional = true;

export const WordArg: ArgType<string> = (input: string) => {
    const m = /^\w+/.exec(input);
    if (!m) return either.left('Not a word');
    const rest = input.substring(m[0].length);
    return either.right([m[0], rest]);
};

export const RationalArg: ArgType<RationalDef> = (input: string) => {
    const m = /^(\d+)\/(\d+)/.exec(input);
    if (!m) return either.left('Not a rational');
    const rest = input.substring(m[0].length);
    return either.right([{
        numerator: parseInt(m[1]),
        denominator: parseInt(m[2])
    }, rest]);
};
