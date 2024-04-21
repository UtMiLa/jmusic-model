import R = require('ramda');
import { ArgType, ArgumentType, _exceptionToEither, matches } from './base-argument-types';


type stringInterpolation = [] | [string | RegExp] | [string, string | RegExp]
    | [ArgumentType<undefined>] | [string | RegExp, ArgumentType<undefined>] | [string | RegExp, ArgumentType<undefined>, string | RegExp];
type ArgSimple<A> = [A, ...stringInterpolation];
type ArgStarter<A> = [...stringInterpolation, ...ArgSimple<A>];
type ArgDuple<A, B> = [...ArgStarter<A>, ...ArgSimple<B>];
type ArgTriple<A, B, C> = [...ArgDuple<A, B>, ...ArgSimple<C>];
type ArgQuadruple<A, B, C, D> = [...ArgDuple<A, B>, ...ArgSimple<C>, ...ArgSimple<D>];
//type ArgQuintuple<A, B, C, D, E> = [...ArgDuple<A, B>, ...ArgSimple<C>, ...ArgSimple<D>, ...ArgSimple<E>];




function resolveSyntacticSugar<T>(arg: ArgumentType<T> | string | RegExp): ArgumentType<T | undefined> {
    if (typeof arg === 'string') {
        const tester = new RegExp('^' + arg.replace(/ $/, '\\s+'));
        const res: ArgumentType<T | undefined> = (input: string) => {
            const match = tester.exec(input);
            if (!match || !match.length) throw 'Missing keyword';
            return [undefined, input.substring(match[0].length)];
        };
        res.undefinedWhenOptional = true;
        return res;
    } else if (arg instanceof RegExp) {
        const res: ArgumentType<T | undefined> = (input: string) => {
            const match = arg.exec(input);
            if (!match || !match.length) throw 'Missing keyword';
            const len = match[0].length;
            if (input.substring(0, len) !== match[0]) throw 'Keyword in incorrect position';
            return [undefined, input.substring(len)];
        };
        res.undefinedWhenOptional = true;
        return res;
    }
    return arg;
}

export function many<T>(type: ArgumentType<T>, separator = '\\s*', allowEmpty = false): ArgType<T[]> {
    return _exceptionToEither(many0(type));
}
function many0<T>(type: ArgumentType<T>, separator = '\\s*', allowEmpty = false): ArgumentType<T[]> {
    return (input: string) => {
        let rest = input;
        const retVal = [];
        while (matches(type, rest)) { // cache result
            const [val, r] = type(rest);
            retVal.push(val);
            rest = r.replace(new RegExp('^' + separator), '');
        }
        return [retVal, rest];        
    };
}

export function optional<T>(type0: ArgumentType<T>): ArgType<T | null>;
export function optional(type0: string): ArgType<undefined>;
export function optional<T>(type0: ArgumentType<T> | string): ArgType<T | null | undefined> {
    return _exceptionToEither(optional0(type0));
}
function optional0<T>(type0: ArgumentType<T> | string): ArgumentType<T | null | undefined> {
    const type = resolveSyntacticSugar(type0);
    return (input: string) => {
        let rest = input;
        if (matches(type, rest)) { // cache result
            const [val, r] = type(rest);
            rest = r;
            return [val, rest];
        }
        if (type.undefinedWhenOptional) return [undefined, rest];
        return [null, rest];
    };
}

export function sequence<T>(types0: ArgStarter<ArgumentType<T>>): ArgType<[T]>;
export function sequence<S,T>(types0: ArgDuple<ArgumentType<S>, ArgumentType<T>>): ArgType<[S, T]>;
export function sequence<S,T,U>(types0: ArgTriple<ArgumentType<S>, ArgumentType<T>, ArgumentType<U>>): ArgType<[S, T, U]>;
export function sequence<S,T,U,V>(types0: ArgQuadruple<ArgumentType<S>, ArgumentType<T>, ArgumentType<U>, ArgumentType<V>>): ArgType<[S, T, U, V]>;
//export function sequence<S,T,U,V,W>(types0: ArgQuintuple<ArgumentType<T>, ArgumentType<S>, ArgumentType<U>, ArgumentType<V>, ArgumentType<W>>): ArgumentType<[S, T, U, V, W]>;
export function sequence<T>(types0: (ArgumentType<T> | string | RegExp)[]): ArgType<T[]> {
    return _exceptionToEither(_sequence(types0));
}
export function _sequence<T>(types0: (ArgumentType<T> | string | RegExp)[]): ArgumentType<T[]> {
    const types = types0.map(resolveSyntacticSugar);
    return (input: string) => {
        let rest = input;
        const retVal = types.map(type => { // cache result
            const [val, r] = type(rest);
            rest = r;
            return val;
        });
        return [retVal.filter((x, i) => x !== undefined), rest] as [T[], string];
    };
}

export function select<T>(types0: [ArgumentType<T>]): ArgType<T>;
export function select<S,T>(types0: [ArgumentType<S>, ArgumentType<T>]): ArgType<S | T>;
export function select<S,T,U>(types0: [ArgumentType<S>, ArgumentType<T>, ArgumentType<U>]): ArgType<S | T | U>;
export function select<S,T,U,V>(types0: [ArgumentType<S>, ArgumentType<T>, ArgumentType<U>, ArgumentType<V>]): ArgType<S | T | U | V>;
export function select<S,T,U,V,W>(types0: [ArgumentType<T>, ArgumentType<S>, ArgumentType<U>, ArgumentType<V>, ArgumentType<W>]): ArgType<S | T | U | V | W>;
export function select<S,T,U,V,W,X>(types0: [ArgumentType<T>, ArgumentType<S>, ArgumentType<U>, ArgumentType<V>, ArgumentType<W>, ArgumentType<X>]): ArgType<S | T | U | V | W | X>;
export function select<S,T,U,V,W,X,Y>(types0: [ArgumentType<T>, ArgumentType<S>, ArgumentType<U>, ArgumentType<V>, ArgumentType<W>, ArgumentType<X>, ArgumentType<Y>]): ArgType<S | T | U | V | W | X | Y>;
export function select(types0: (ArgumentType<any> | string)[]): ArgType<any> {
    return _exceptionToEither(select0(types0));
}
export function select0(types0: (ArgumentType<any> | string)[]): ArgumentType<any> {
    const types = types0.map(resolveSyntacticSugar);
    return (input: string) => {
        const match = types.find(type => matches(type, input)); // cache result
        if (!match) throw 'Syntax error';

        return match(input);
    };
}


export function mapResult<T, S>(type: ArgumentType<T>, mapper: (arg: T) => (S)): ArgumentType<S> {
    return (input: string) => {
        const [res, rest] = type(input);
        return [mapper(res), rest];
    };
}
