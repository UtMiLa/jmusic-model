import { Rational, RationalDef } from './../../model/rationals/rational';
import { AbsoluteTime } from './../../model/rationals/time';
import { ArgumentType, FixedArg, MusicEventArg, NoteArg, RationalArg, SpaceArg } from './argument-types';
import { many, optional, sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Time, Model, MultiSequenceDef, MultiSequenceItem, SplitSequenceDef, isSplitSequence, Note, MusicEvent, FlexibleSequence, NoteDef } from './../../model';
import R = require('ramda');

interface CommandDescriptor<T> {
    argType: ArgumentType<T>;
    action: (args: T) => (model: Model, ins: InsertionPoint) => void;
}

// goto AbsoluteTime
// goto next
// goto prev
// goto start


// voice StaffNo:VoiceNo

// append Some(MusicElement)

// set key Key
// set clef Clef
// set meter Meter

export const navigationCommands: CommandDescriptor<any>[] = [
    { 
        argType: sequence(['goto', SpaceArg, 'next']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveRight() 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence(['goto', SpaceArg, 'prev']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveLeft() 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence<void>(['goto', SpaceArg, 'start']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveToTime(Time.newAbsolute(0, 1)) 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence<RationalDef>(['goto', SpaceArg, RationalArg]), 
        action: (args: [RationalDef]) => (model: Model, ins: InsertionPoint): void => 
            ins.moveToTime({ ...args[0], type: 'abs' })
    } as CommandDescriptor<[RationalDef]>,
    { 
        argType: sequence(['append', SpaceArg, many(MusicEventArg)]), 
        action: (args: [MusicEvent[]]) => (model: Model, ins: InsertionPoint): void => {
            const events = args[0];
            const eventDef = new FlexibleSequence(events).def;
            model.overProject(
                R.lensPath(['score', 'staves', ins.staffNo, 'voices', ins.voiceNo, 'contentDef']),
                (seq: MultiSequenceDef) => 
                    R.cond<MultiSequenceDef, SplitSequenceDef, string, MultiSequenceItem[], MultiSequenceDef>([
                        [isSplitSequence, R.identity],
                        [R.is(String), (s: string) => (s + ' ' + eventDef) as MultiSequenceDef],
                        [(R.is(Array<MultiSequenceItem>)), m => [...m, eventDef as NoteDef[]]] // todo: fix ugly cast
                    ])(seq)
            );
        }
    } as CommandDescriptor<[MusicEvent[]]>
];
/*
navigationCommands.forEach(cmd => {
    const args = cmd.argType.parse('vghj');
    cmd.action(args);
});
*/