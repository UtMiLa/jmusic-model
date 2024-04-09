import { map } from 'ramda';
import { ArgumentType } from './argument-types';


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

export function optional<T>(type: ArgumentType<T>): ArgumentType<T | null> {
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
            return [null, rest];
        }
    };
}

export function sequence(types: ArgumentType<any>[]): ArgumentType<any[]> {
    return {
        regex: () => types.map(t => `(${t.regex()})`).join(''),
        parse: (input: string) => {
            let rest = input;
            const retVal = types.map(type => {
                const [val, r] = type.parse(rest);
                rest = r;
                return val;
            });
            return [retVal, rest];
        }
    };
}

export function select(types: ArgumentType<any>[]): ArgumentType<any[]> {
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