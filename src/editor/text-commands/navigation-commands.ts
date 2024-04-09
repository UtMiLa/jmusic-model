import { Rational, RationalDef } from './../../model/rationals/rational';
import { AbsoluteTime } from './../../model/rationals/time';
import { FixedArg, MusicEventArg, NoteArg, RationalArg } from './argument-types';
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
        argType: sequence([FixedArg('goto'), FixedArg(' next')]), 
        action: (args: string[]) => (model: Model, ins: InsertionPoint): void => ins.moveRight() 
    },
    { 
        argType: sequence([FixedArg('goto'), FixedArg(' prev')]), 
        action: (args: string[]) => (model: Model, ins: InsertionPoint): void => ins.moveLeft() 
    },
    { 
        argType: sequence([FixedArg('goto'), FixedArg(' start')]), 
        action: (args: string[]) => (model: Model, ins: InsertionPoint): void => ins.moveToTime(Time.newAbsolute(0, 1)) 
    },
    { 
        argType: sequence([FixedArg('goto '), RationalArg]), 
        action: (args: [string, RationalDef]) => (model: Model, ins: InsertionPoint): void => 
            ins.moveToTime({ ...args[1], type: 'abs' })
    },
    { 
        argType: sequence([FixedArg('append '), many(MusicEventArg)]), 
        action: (args: [string, MusicEvent[]]) => (model: Model, ins: InsertionPoint): void => {
            const events: MusicEvent[] = args[1];
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