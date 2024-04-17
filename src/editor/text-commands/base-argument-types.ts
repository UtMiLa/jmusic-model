import { RationalDef } from '../../model';

export interface ArgumentType<T> {
    (input: string): [T, string];
    undefinedWhenOptional?: boolean;
}

export function matches<T>(argt: ArgumentType<T>, input: string): boolean {
    try {
        const v = argt(input);
        if (v) return true;
    } catch {
        return false;
    }
    return false;
}

export const FixedArg = (arg: string): ArgumentType<string> => (input: string) => {
    const m = new RegExp('^' + arg).exec(input);
    if (!m) throw 'Not a match';
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
