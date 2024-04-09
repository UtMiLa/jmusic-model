import { Note, RationalDef, createNoteFromLilypond } from '../../model';

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


/*
export const PitchArg: ArgumentType<Pitch> = {
    regex(): string {
        return '[a-gr](es|is)*[\',]*';
    },

    parse(input: string) {
        const items = input.split(/\s+/);
        if (items.length) {
            const m = createNoteFromLilypond(items[0]);
            items.shift();
            return [m.pitches[0], items.join(' ')];
        }
        throw 'Illegal note';
    }
};

export const ChordArg: ArgumentType<Pitch[]> = sequence(['<', many(PitchArg), '>']);
export const DurationArg: ArgumentType<string[]> = sequence([IntegerArg, many(FixedArg('.'))]);
*/

export const NoteArg: ArgumentType<Note> = {
    // todo: make it a sequence([select([PitchArg, ChordArg]), DurationArg, many(MarkerArg), optional(TieArg)])
    regex(): string {
        return /([a-gr](es|is)*[',]*)(\d+\.*)((\\[a-z]+)*)(~?)/.source;
    },
    //const matcher = /^([a-gr](es|is)*[',]*)(\d+\.*)((\\[a-z]+)*)(~?)$/i;
    //const matcherChord = /^<([a-z,' ]+)>(\d+\.*)((\\[a-z]+)*)(~?)$/i;

    parse(input: string) {
        const items = input.split(/\s+/);
        if (items.length) {
            const m = createNoteFromLilypond(items[0]);
            items.shift();
            return [m, items.join(' ')];
        }
        throw 'Illegal note';
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