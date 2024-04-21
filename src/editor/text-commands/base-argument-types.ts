import { either, eitherT } from 'fp-ts';
import { RationalDef } from '../../model';
import { left } from 'fp-ts/lib/EitherT';
import { Either } from 'fp-ts/lib/Either';
import {  } from 'fp-ts/lib/Tuple';

function regexEscape(s: string): string { // taken from sanctuary.js
    return s.replace (/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export interface ArgumentType<T> {
    (input: string): [T, string];
    undefinedWhenOptional?: boolean;
}

export function _exceptionToEither<T>(arg: ArgumentType<T>): ArgumentType<Either<string, T>> {
    return (input: string) => {
        try {
            const res = arg(input);
            return [either.right(res[0]), res[1]];
        } catch(e: unknown) { 
            return [either.left(e as string), input];
        }        
    };
}

export function matches<T>(argt: ArgumentType<T>, input: string): boolean {
    const arg = _exceptionToEither(argt);
    const v = arg(input);
    return either.isRight(v[0]);
}

export const FixedArg = (arg: string | RegExp): ArgumentType<string> => (input: string) => {
    const m = (arg instanceof RegExp ? arg : new RegExp('^' + regexEscape(arg))).exec(input);
    //if (!m) return either.left('Not a match');
    if (!m) throw 'Not a match';
    //if (input.indexOf(m[0]) !== 0) return either.left('Not a match in correct position');
    if (input.indexOf(m[0]) !== 0) throw 'Not a match in correct position';
    const rest = input.substring(m[0].length);
    return [m[0], rest];
};

export const IntegerArg: ArgumentType<number> = (input: string) => {
    const m = /^\d+/.exec(input);
    if (!m) throw 'Not an integer';
    const rest = input.substring(m[0].length);
    return [parseInt(m[0]), rest];
};

export const WhitespaceArg: ArgumentType<undefined> = (input: string) => {
    const m = /^\s+/.exec(input);
    if (!m) throw 'Not a whitespace';
    const rest = input.substring(m[0].length);
    return [undefined, rest];
};
WhitespaceArg.undefinedWhenOptional = true;

export const WordArg: ArgumentType<string> = (input: string) => {
    const m = /^\w+/.exec(input);
    if (!m) throw 'Not a word';
    const rest = input.substring(m[0].length);
    return [m[0], rest];
};

export const RationalArg: ArgumentType<RationalDef> = (input: string) => {
    const m = /^(\d+)\/(\d+)/.exec(input);
    if (!m) throw 'Not a rational';
    const rest = input.substring(m[0].length);
    return [{
        numerator: parseInt(m[1]),
        denominator: parseInt(m[2])
    }, rest];
};
