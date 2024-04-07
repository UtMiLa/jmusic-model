import { Rational, RationalDef } from './../../model/rationals/rational';
import { AbsoluteTime } from './../../model/rationals/time';
import { FixedArg, RationalArg, sequence } from './argument-types';
import { InsertionPoint } from '../insertion-point';
import { Time, Model } from './../../model';


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
    }
];