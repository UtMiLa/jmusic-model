import { StateChange } from './../../model/states/state';
import { Clef, Key, MeterFactory, MusicEvent, Note, Pitch, PitchClass, RationalDef, Time, TimeSpan, createNoteFromLilypond, fromLilypondAlteration, fromLilypondOctave, fromLilypondPitchClass, parseLilyClef } from '../../model';
import { many, mapResult, select, sequence } from './argument-modifiers';
import { Spacer, createSpacerFromLilypond } from '../../model/notes/spacer';

export interface ArgumentType<T> {
    regex(): string;
    parse(input: string): [T, string];
    undefinedWhenOptional?: boolean;
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

export const SpaceArg: ArgumentType<undefined> = {
    regex: (): string => {
        return '\\s+';
    },

    parse: (input: string) => {
        const m = /^\s+/.exec(input);
        if (!m) throw 'Not a whitespace';
        const rest = input.substring(m[0].length);
        return [undefined, rest];
    },
    
    undefinedWhenOptional: true
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



export const PitchClassArg: ArgumentType<PitchClass> = {
    regex(): string {
        return '[a-g](es|is)*';
    },

    parse(input: string) {
        const matcher = /^([a-g])((es|is)*)/;
        const parsed = matcher.exec(input);
        
        if (!parsed || parsed.length < 2) throw 'Illegal pitch class: '+ input;

        const alteration = fromLilypondAlteration(parsed[2]);
        const pitchClass = fromLilypondPitchClass(parsed[1]);

        return [new PitchClass(pitchClass, alteration), input.substring(parsed[0].length)];
    }
};

export const OctaveArg: ArgumentType<number> = {
    regex(): string {
        return '[\',]*';
    },

    parse(input: string) {
        const items = /^[',]*/.exec(input);

        if (items) {
            const m = fromLilypondOctave(items[0]);
            return [m, input.substring(items[0].length)];
        }
        throw 'Illegal octave';
    }
};

export const PitchArg: ArgumentType<Pitch> = mapResult(sequence([PitchClassArg, OctaveArg]), ([pc, oct]) => new Pitch(pc.pitchClass, oct, pc.alteration));

export const ChordArg: ArgumentType<Pitch[]> = mapResult(sequence(['<', many(PitchArg), '>']), pitches => pitches[0]);

export const DurationArg: ArgumentType<TimeSpan> = mapResult(sequence([IntegerArg, many(FixedArg('.'))]), ([dur, dots]) => Time.newSpan(1, dur)); // todo: dots


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

export const SpacerArg: ArgumentType<Spacer> = { // todo: maybe find a better name for this or SpaceArg
    regex(): string {
        return /s(\d+\.*)/.source;
    },

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

export const MusicEventArg = (select as (_: unknown[]) => ArgumentType<MusicEvent>)([NoteArg, KeyArg, MeterArg, ClefArg, SpacerArg]); // todo: LongDecoration, ...

