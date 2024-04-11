import { Rational, RationalDef } from './../../model/rationals/rational';
import { AbsoluteTime } from './../../model/rationals/time';
import { FixedArg, MusicEventArg, NoteArg, RationalArg, SpaceArg } from './argument-types';
import { many, optional, sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Time, Model, MultiSequenceDef, MultiSequenceItem, SplitSequenceDef, isSplitSequence, Note, MusicEvent, FlexibleSequence, NoteDef } from './../../model';
import R = require('ramda');


// goto AbsoluteTime
// goto next
// goto prev
// goto start


// voice StaffNo:VoiceNo

// append Some(MusicElement)

// set key Key
// set clef Clef
// set meter Meter

export const navigationCommands = [
    { 
        argType: sequence(['goto', SpaceArg, 'next']), 
        action: (args: string[]) => (model: Model, ins: InsertionPoint): void => ins.moveRight() 
    },
    { 
        argType: sequence(['goto', SpaceArg, 'prev']), 
        action: (args: string[]) => (model: Model, ins: InsertionPoint): void => ins.moveLeft() 
    },
    { 
        argType: sequence(['goto', SpaceArg, 'start']), 
        action: (args: string[]) => (model: Model, ins: InsertionPoint): void => ins.moveToTime(Time.newAbsolute(0, 1)) 
    },
    { 
        argType: sequence(['goto', SpaceArg, RationalArg]), 
        action: (args: [RationalDef]) => (model: Model, ins: InsertionPoint): void => 
            ins.moveToTime({ ...args[0], type: 'abs' })
    },
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
    }
];