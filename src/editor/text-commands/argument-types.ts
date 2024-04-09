import { StateChange } from './../../model/states/state';
import { Clef, Key, MeterFactory, Note, RationalDef, createNoteFromLilypond, parseLilyClef } from '../../model';
import { mapResult, select, sequence } from './argument-modifiers';
import { Spacer, createSpacerFromLilypond } from '../../model/notes/spacer';

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

export const WordArg: ArgumentType<string> = {
    regex: (): string => {
        return '\\w+';
    },

    parse: (input: string) => {
        const m = /^\w+/.exec(input);
        if (!m) throw 'Not a word';
        const rest = input.substring(m[0].length);
        return [m[0], rest];
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

export const SpacerArg: ArgumentType<Spacer> = {
    // todo: make it a sequence([select([PitchArg, ChordArg]), DurationArg, many(MarkerArg), optional(TieArg)])
    regex(): string {
        return /s(\d+\.*)/.source;
    },
    //const matcher = /^([a-gr](es|is)*[',]*)(\d+\.*)((\\[a-z]+)*)(~?)$/i;
    //const matcherChord = /^<([a-z,' ]+)>(\d+\.*)((\\[a-z]+)*)(~?)$/i;

    parse(input: string) {
        const items = input.split(/\s+/);
        if (items.length) {
            const m = createSpacerFromLilypond(items[0]);
            items.shift();
            return [m, items.join(' ')];
        }
        throw 'Illegal spacer';
    }
};

const _keyArg = sequence([IntegerArg, select([FixedArg('#'), FixedArg('b')])]);
export const KeyArg = mapResult(_keyArg, ([count, acc]) => (StateChange.newKeyChange(new Key({ count, accidental: acc === '#' ? 1 : -1 }))));

export const MeterArg = mapResult(RationalArg, (r: RationalDef) => (StateChange.newMeterChange(MeterFactory.createRegularMeter({ count: r.numerator, value: r.denominator }))));

const _clefArg = sequence([FixedArg('\\\\clef '), WordArg]);
export const ClefArg = mapResult(_clefArg, ([keyword, value]) => (StateChange.newClefChange(parseLilyClef(value))));

export const MusicEventArg = select([NoteArg, KeyArg, MeterArg, ClefArg, SpacerArg]); // todo: LongDecoration, ...
