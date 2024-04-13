import { ArgumentType } from './base-argument-types';


type stringInterpolation = [] | [string] | [string, string]
    | [ArgumentType<undefined>] | [string, ArgumentType<undefined>] | [string, ArgumentType<undefined>, string];
type ArgSimple<A> = [A, ...stringInterpolation];
type ArgStarter<A> = [...stringInterpolation, ...ArgSimple<A>];
type ArgDuple<A, B> = [...ArgStarter<A>, ...ArgSimple<B>];
type ArgTriple<A, B, C> = [...ArgDuple<A, B>, ...ArgSimple<C>];
type ArgQuadruple<A, B, C, D> = [...ArgDuple<A, B>, ...ArgSimple<C>, ...ArgSimple<D>];
//type ArgQuintuple<A, B, C, D, E> = [...ArgDuple<A, B>, ...ArgSimple<C>, ...ArgSimple<D>, ...ArgSimple<E>];




function resolveSyntacticSugar<T>(arg: ArgumentType<T> | string): ArgumentType<T | undefined> {
    if (typeof arg === 'string') {
        const tester = new RegExp('^' + arg.replace(/ $/, '\\s+'));
        return  {
            regex: () => tester.source.substring(1),
            parse: (input: string) => {
                const match = tester.exec(input);
                if (!match || !match.length) throw 'Missing keyword';
                return [undefined, input.substring(match[0].length)];
            },
            undefinedWhenOptional: true
        };
    }
    return arg;
}


export function many<T>(type: ArgumentType<T>, separator = '\\s*', allowEmpty = false): ArgumentType<T[]> {
    return {
        regex: () => `(${type.regex()}${separator})${allowEmpty ? '*' : '+'}`,
        parse: (input: string) => {
            const typeRegex = new RegExp('^' + type.regex());
            let rest = input;
            const retVal = [];
            while (typeRegex.test(rest)) {
                const [val, r] = type.parse(rest);
                retVal.push(val);
                rest = r.replace(new RegExp('^' + separator), '');
            }
            return [retVal, rest];
        }
    };
}

export function optional<T>(type0: ArgumentType<T>): ArgumentType<T | null>;
export function optional(type0: string): ArgumentType<undefined>;
export function optional<T>(type0: ArgumentType<T> | string): ArgumentType<T | null | undefined> {
    const type = resolveSyntacticSugar(type0);
    return {
        regex: () => `(${type.regex()})?`,
        parse: (input: string) => {
            const typeRegex = new RegExp('^' + type.regex());
            let rest = input;
            if (typeRegex.test(rest)) {
                const [val, r] = type.parse(rest);
                rest = r;
                return [val, rest];
            }
            if (type.undefinedWhenOptional) return [undefined, rest];
            return [null, rest];
        }
    };
}

export function sequence<T>(types0: ArgStarter<ArgumentType<T>>): ArgumentType<[T]>;
export function sequence<S,T>(types0: ArgDuple<ArgumentType<S>, ArgumentType<T>>): ArgumentType<[S, T]>;
export function sequence<S,T,U>(types0: ArgTriple<ArgumentType<S>, ArgumentType<T>, ArgumentType<U>>): ArgumentType<[S, T, U]>;
export function sequence<S,T,U,V>(types0: ArgQuadruple<ArgumentType<S>, ArgumentType<T>, ArgumentType<U>, ArgumentType<V>>): ArgumentType<[S, T, U, V]>;
//export function sequence<S,T,U,V,W>(types0: ArgQuintuple<ArgumentType<T>, ArgumentType<S>, ArgumentType<U>, ArgumentType<V>, ArgumentType<W>>): ArgumentType<[S, T, U, V, W]>;
export function sequence<T>(types0: (ArgumentType<T> | string)[]): ArgumentType<T[]> {
    const types = types0.map(resolveSyntacticSugar);
    return {
        regex: () => types.map(t => `(${t.regex()})`).join(''),
        parse: (input: string) => {
            let rest = input;
            const retVal = types.map(type => {
                const [val, r] = type.parse(rest);
                rest = r;
                return val;
            });
            return [retVal.filter((x, i) => x !== undefined), rest] as [T[], string];
        }
    };
}

export function select<T>(types0: [ArgumentType<T>]): ArgumentType<T>;
export function select<S,T>(types0: [ArgumentType<S>, ArgumentType<T>]): ArgumentType<S | T>;
export function select<S,T,U>(types0: [ArgumentType<S>, ArgumentType<T>, ArgumentType<U>]): ArgumentType<S | T | U>;
export function select<S,T,U,V>(types0: [ArgumentType<S>, ArgumentType<T>, ArgumentType<U>, ArgumentType<V>]): ArgumentType<S | T | U | V>;
export function select<S,T,U,V,W>(types0: [ArgumentType<T>, ArgumentType<S>, ArgumentType<U>, ArgumentType<V>, ArgumentType<W>]): ArgumentType<S | T | U | V | W>;
export function select(types0: (ArgumentType<any> | string)[]): ArgumentType<any> {
    const types = types0.map(resolveSyntacticSugar);
    return {
        regex: () => types.map(t => `(${t.regex()})`).join('|'),
        parse: (input: string) => {
            const match = types.find(type => new RegExp('^' + type.regex()).test(input));
            if (!match) throw 'Syntax error';

            return match.parse(input);
        }
    };
}


export function mapResult<T, S>(type: ArgumentType<T>, mapper: (arg: T) => (S)): ArgumentType<S> {
    return {
        regex: () => type.regex(),
        parse: (input: string) => {
            const [res, rest] = type.parse(input);
            return [mapper(res), rest];
        }
    };
}
