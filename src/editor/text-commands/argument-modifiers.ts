import R = require('ramda');
import { ArgType, matches } from './base-argument-types';
import { either } from 'fp-ts';
import { Either, Left } from 'fp-ts/lib/Either';


export interface ArgumentType<T> {
    (input: string): [T, string];
    undefinedWhenOptional?: boolean;
}


function _exceptionToEither<T>(arg: ArgumentType<T>): ArgType<T> {
    const f = (input: string) => {
        try {
            const res = arg(input);
            return either.right(res);
        } catch(e: unknown) { 
            return either.left(e as string);
        }        
    };
    f.undefinedWhenOptional = arg.undefinedWhenOptional;
    return f;
}


function _eitherToException<T>(arg: ArgType<T>): ArgumentType<T> {
    const f = (input: string) => {
        const res = arg(input);
        if (either.isLeft(res)) throw res.left;
        return res.right;
    };
    f.undefinedWhenOptional = arg.undefinedWhenOptional;
    return f;
}

type stringInterpolation = [] | [string | RegExp] | [string, string | RegExp]
    | [ArgType<undefined>] | [string | RegExp, ArgType<undefined>] | [string | RegExp, ArgType<undefined>, string | RegExp];
type ArgSimple<A> = [A, ...stringInterpolation];
type ArgStarter<A> = [...stringInterpolation, ...ArgSimple<A>];
type ArgDuple<A, B> = [...ArgStarter<A>, ...ArgSimple<B>];
type ArgTriple<A, B, C> = [...ArgDuple<A, B>, ...ArgSimple<C>];
type ArgQuadruple<A, B, C, D> = [...ArgDuple<A, B>, ...ArgSimple<C>, ...ArgSimple<D>];
//type ArgQuintuple<A, B, C, D, E> = [...ArgDuple<A, B>, ...ArgSimple<C>, ...ArgSimple<D>, ...ArgSimple<E>];




function resolveSyntacticSugar<T>(arg: ArgType<T> | string | RegExp): ArgType<T | undefined> {
    if (typeof arg === 'string') {
        const tester = new RegExp('^' + arg.replace(/ $/, '\\s+'));
        const res: ArgType<T | undefined> = (input: string) => {
            const match = tester.exec(input);
            if (!match || !match.length) return either.left('Missing keyword');
            return either.right([undefined, input.substring(match[0].length)]);
        };
        res.undefinedWhenOptional = true;
        return res;
    } else if (arg instanceof RegExp) {
        const res: ArgType<T | undefined> = (input: string) => {
            const match = arg.exec(input);
            if (!match || !match.length) return either.left('Missing keyword');
            const len = match[0].length;
            if (input.substring(0, len) !== match[0]) return either.left('Keyword in incorrect position');
            return either.right([undefined, input.substring(len)]);
        };
        res.undefinedWhenOptional = true;
        return res;
    }
    return arg;
}

export function many<T>(type: ArgType<T>, separator = '\\s*', allowEmpty = false): ArgType<T[]> {
    return (input: string) => {
        let rest = input;
        const retVal = [];
        while (matches(type, rest)) { // cache result
            const [val, r] = _eitherToException(type)(rest);
            retVal.push(val);
            rest = r.replace(new RegExp('^' + separator), '');
        }
        return either.right([retVal, rest]);
    };
}

export function optional<T>(type0: ArgType<T>): ArgType<T | null>;
export function optional(type0: string): ArgType<undefined>;
export function optional<T>(type0: ArgType<T> | string): ArgType<T | null | undefined> {
    const type = resolveSyntacticSugar(type0);
    return (input: string) => {
        const rest = input;
        if (matches((type), rest)) { // cache result
            const res = type(rest);
            if (either.isRight(res)) return res;
        }
        if (type.undefinedWhenOptional) return either.right([undefined, rest]);
        return either.right([null, rest]);
    };
}

export function sequence<T>(types0: ArgStarter<ArgType<T>>): ArgType<[T]>;
export function sequence<S,T>(types0: ArgDuple<ArgType<S>, ArgType<T>>): ArgType<[S, T]>;
export function sequence<S,T,U>(types0: ArgTriple<ArgType<S>, ArgType<T>, ArgType<U>>): ArgType<[S, T, U]>;
export function sequence<S,T,U,V>(types0: ArgQuadruple<ArgType<S>, ArgType<T>, ArgType<U>, ArgType<V>>): ArgType<[S, T, U, V]>;
//export function sequence<S,T,U,V,W>(types0: ArgQuintuple<ArgType<T>, ArgType<S>, ArgType<U>, ArgType<V>, ArgType<W>>): ArgType<[S, T, U, V, W]>;
export function sequence(types0: (ArgType<unknown> | string | RegExp)[]): ArgType<unknown> {
    const types = types0.map(resolveSyntacticSugar);
    return (input: string): Either<string, [unknown, string]> => {
        let rest = input;
        const retVal = types.map(type => { // cache result
            const res = type(rest);
            if (either.isLeft(res)) return res;
            rest = res.right[1];
            return res.right[0];
        }).filter((x) => x !== undefined);

        const leftie = retVal.find((x: unknown) => x && either.isLeft(x as any)) as Left<string>;
        if (leftie) return leftie;
        return either.right([retVal, rest]);
    };
}

export function select<T>(types0: [ArgType<T>]): ArgType<T>;
export function select<S,T>(types0: [ArgType<S>, ArgType<T>]): ArgType<S | T>;
export function select<S,T,U>(types0: [ArgType<S>, ArgType<T>, ArgType<U>]): ArgType<S | T | U>;
export function select<S,T,U,V>(types0: [ArgType<S>, ArgType<T>, ArgType<U>, ArgType<V>]): ArgType<S | T | U | V>;
export function select<S,T,U,V,W>(types0: [ArgType<T>, ArgType<S>, ArgType<U>, ArgType<V>, ArgType<W>]): ArgType<S | T | U | V | W>;
export function select<S,T,U,V,W,X>(types0: [ArgType<T>, ArgType<S>, ArgType<U>, ArgType<V>, ArgType<W>, ArgType<X>]): ArgType<S | T | U | V | W | X>;
export function select<S,T,U,V,W,X,Y>(types0: [ArgType<T>, ArgType<S>, ArgType<U>, ArgType<V>, ArgType<W>, ArgType<X>, ArgType<Y>]): ArgType<S | T | U | V | W | X | Y>;
export function select(types0: (ArgType<any> | string)[]): ArgType<any> {
    return _exceptionToEither(select0(types0));
}
export function select0(types0: (ArgType<any> | string)[]): ArgumentType<any> {
    const types = types0.map(resolveSyntacticSugar).map(_eitherToException);
    return (input: string) => {
        const match = types.find(type => matches(_exceptionToEither(type), input)); // cache result
        if (!match) throw 'Syntax error';

        return match(input);
    };
}

/** Maps result from ArgType<T> to ArgType<S> using mapper() */
export function mapResult<T, S>(type: ArgType<T>, mapper: (arg: T) => (S)): ArgType<S> {
    return (input: string) => either.map<[T, string], [S, string]>(([res, rest]: [T, string]) => ([mapper(res), rest]))(type(input));
}

