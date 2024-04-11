import { ArgumentType } from './argument-types';
//import { ConcatMultiple } from 'typescript-tuple';
/*
export type IsFinite<Tuple extends any[], Finite, Infinite> = {
    empty: Finite
    nonEmpty: ((..._: Tuple) => any) extends ((_: infer First, ..._1: infer Rest) => any)
      ? IsFinite<Rest, Finite, Infinite>
      : never
    infinite: Infinite
  }[
    Tuple extends [] ? 'empty' :
    Tuple extends (infer Element)[] ?
    Element[] extends Tuple ?
      'infinite'
    : 'nonEmpty'
    : never
  ]
  

export type Prepend<Tuple extends any[], Addend> =
  ((_: Addend, ..._1: Tuple) => any) extends ((..._: infer Result) => any) ? Result : never

export type Reverse<Tuple extends any[], Prefix extends any[] = []> = {
  empty: Prefix,
  nonEmpty: ((..._: Tuple) => any) extends ((_: infer First, ..._1: infer Next) => any)
    ? Reverse<Next, Prepend<Prefix, First>>
    : never
  infinite: {
    ERROR: 'Cannot reverse an infinite tuple'
    CODENAME: 'InfiniteTuple'
  }
}[
  Tuple extends [any, ...any[]]
    ? IsFinite<Tuple, 'nonEmpty', 'infinite'>
    : 'empty'
]

export type Concat<Left extends any[], Right extends any[]> = {
  emptyLeft: Right
  singleLeft: Left extends [infer SoleElement]
    ? Prepend<Right, SoleElement>
    : never
  multiLeft: ((..._: Reverse<Left>) => any) extends ((_: infer LeftLast, ..._1: infer ReversedLeftRest) => any)
    ? Concat<Reverse<ReversedLeftRest>, Prepend<Right, LeftLast>>
    : never
  infiniteLeft: {
    ERROR: 'Left is not finite',
    CODENAME: 'InfiniteLeft' & 'Infinite'
  }
}[
  Left extends [] ? 'emptyLeft' :
  Left extends [any] ? 'singleLeft' :
  IsFinite<Left, 'multiLeft', 'infiniteLeft'>
]

export type ConcatMultiple<TupleSet extends any[][]> = {
    empty: []
    nonEmpty: ((..._: Reverse<TupleSet>) => any) extends ((_: infer Last, ..._1: infer ReversedRest) => any) ?
      Last extends any[] ?
      ReversedRest extends any[][] ?
        Concat<ConcatMultiple<Reverse<ReversedRest>>, Last> :
      never :
      never :
      never
    infinite: {
      ERROR: 'TupleSet is not finite',
      CODENAME: 'InfiniteTupleSet' & 'Infinite'
    }
  }[
    TupleSet extends [] ? 'empty' : IsFinite<TupleSet, 'nonEmpty', 'infinite'>
  ]
  */
/*
*/
type Concat<T> = T extends [infer A, ...infer Rest]
    ? A extends any[] ? [...A, ...Concat<Rest>] : A
    : T;

type ArgSimple<A> = [A] | [A, string];
type ArgStarter<A> = ArgSimple<A> | [string, ...ArgSimple<A>];

type ArgDuple<A, B> = Concat<[ArgStarter<A>, ArgSimple<B>]>;

type ArgTriple<A, B, C> = Concat<[ArgDuple<A, B>, ArgSimple<C>]>;
type ArgQuadruple<A, B, C, D> = Concat<[ArgDuple<A, B>, ArgSimple<C>, ArgSimple<D>]>;
/*
// Example usage for MyTuple
const tuple1: MyTuple<number, boolean> = [1, true];
const tuple2: MyTuple<number, boolean> = [1, 'hello', true];
const tuple3: MyTuple<number, boolean> = ['start', 1, true, 'end'];

// Example usage for MyTriple
const triple1: MyTriple<number, boolean, string> = [1, true, 'hello'];
const triple2: MyTriple<number, boolean, string> = [1, 'world', true, 'hello'];
const triple3: MyTriple<number, boolean, string> = ['start', 1, true, 'hello', 'end'];

*/



function resolveSyntacticSugar<T>(arg: ArgumentType<T> | string): ArgumentType<T | undefined> {
    if (typeof arg === 'string') {
        return  {
            regex: () => arg,
            parse: (input: string) => {
                if (!input.startsWith(arg)) throw 'Missing keyword';
                return [undefined, input.substring(arg.length)];
            },
            undefinedWhenOptional: true
        };
    }
    return arg;
}


export function many<T>(type: ArgumentType<T>): ArgumentType<T[]> {
    return {
        regex: () => `(${type.regex()} *)+`,
        parse: (input: string) => {
            const typeRegex = new RegExp('^' + type.regex());
            let rest = input;
            const retVal = [];
            while (typeRegex.test(rest)) {
                const [val, r] = type.parse(rest);
                retVal.push(val);
                rest = r.trimStart();
            }
            return [retVal, rest];
        }
    };
}

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

//export function sequence<T>(types0: [string, ArgumentType<T>]): ArgumentType<[T]>;
export function sequence<T>(types0: ArgStarter<ArgumentType<T>>): ArgumentType<[T]>;
export function sequence<S,T>(types0: ArgDuple<ArgumentType<T>, ArgumentType<S>>): ArgumentType<[T, S]>;
export function sequence<S,T,U>(types0: ArgTriple<ArgumentType<T>, ArgumentType<S>, ArgumentType<U>>): ArgumentType<[T, S, U]>;
/*export function sequence<S,T>(types0: [string, ArgumentType<T>, ArgumentType<S>]): ArgumentType<[T, S]>;
export function sequence<S,T>(types0: [ArgumentType<T>, string, ArgumentType<S>]): ArgumentType<[T, S]>;
export function sequence<S,T>(types0: [ArgumentType<S>, ArgumentType<T>]): ArgumentType<[S, T]>;*/
/*export function sequence<S,T,U>(types0: [ArgumentType<S>, ArgumentType<T>, ArgumentType<U>]): ArgumentType<[S, T, U]>;
export function sequence<S,T,U>(types0: [ArgumentType<S>, ArgumentType<T>, ArgumentType<U>, string]): ArgumentType<[S, T, U]>;
export function sequence<S,T,U>(types0: [ArgumentType<S>, string, ArgumentType<T>, ArgumentType<U>]): ArgumentType<[S, T, U]>;
export function sequence<S,T,U,V>(types0: [ArgumentType<S>, ArgumentType<T>, ArgumentType<U>, ArgumentType<V>]): ArgumentType<[S, T, U, V]>;*/
export function sequence<S,T,U,V>(types0: ArgQuadruple<S,T,U,V>): ArgumentType<[S, T, U, V]>;
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
