import { Rational, RationalDef } from '../../model';

export interface ArgumentType<T> {
    regex(): string;
    parse(input: string): [T, string];
}

export const FixedArg = (arg: string): ArgumentType<string> => ({
    regex: () => {
        return arg;
    },

    parse: (input: string) => {
        const m = new RegExp('^' + arg).exec(input);
        if (!m) throw 'Not a match';
        const rest = input.substring(m[0].length);
        return [m[0], rest];
    }
});

export const IntegerArg: ArgumentType<number> = {
    regex: (): string => {
        return '\\d+';
    },

    parse: (input: string) => {
        const m = /^\d+/.exec(input);
        if (!m) throw 'Not an integer';
        const rest = input.substring(m[0].length);
        return [parseInt(m[0]), rest];
    }
};

export const RationalArg: ArgumentType<RationalDef> = {
    regex(): string {
        return '\\d+\\/\\d+';
    },

    parse(input: string) {
        const m = /^(\d+)\/(\d+)/.exec(input);
        if (!m) throw 'Not a rational';
        const rest = input.substring(m[0].length);
        return [{
            numerator: parseInt(m[1]),
            denominator: parseInt(m[2])
        }, rest];
    }
};

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
            //const typeRegex = new RegExp('^' + type.regex());
            let rest = input;
            const retVal = types.map(type => {
                const [val, r] = type.parse(rest);
                rest = r;
                return val;
            });
            /*if (typeRegex.test(rest)) {
                const [val, r] = type.parse(rest);
                //retVal = val;
                rest = r;
                return [val, rest];
            }
            //const m = new RegExp(`(${type.regex()}) `, 'g');*/
            return [retVal, rest];
        }
    };
}