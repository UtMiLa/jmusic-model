import { ArgumentType } from './argument-types';

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

export function sequence(types0: (ArgumentType<any> | string)[]): ArgumentType<(any)[]> {
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
            return [retVal.filter((x, i) => x !== undefined), rest];
        }
    };
}

export function select(types0: (ArgumentType<any> | string)[]): ArgumentType<any[]> {
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
