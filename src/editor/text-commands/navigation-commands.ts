import { RationalDef } from './../../model/rationals/rational';
import { VoiceNoArg } from './argument-types';
import { ArgumentType, RationalArg, WhitespaceArg } from './base-argument-types';
import { sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Time, Model } from './../../model';
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


export const navigationCommands: CommandDescriptor<any>[] = [
    { 
        argType: sequence(['goto', WhitespaceArg, 'next']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveRight() 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence(['goto', WhitespaceArg, 'prev']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveLeft() 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence<void>(['goto', WhitespaceArg, 'start']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveToTime(Time.newAbsolute(0, 1)) 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence<RationalDef>(['goto ', RationalArg]), 
        action: (args: [RationalDef]) => (model: Model, ins: InsertionPoint): void => 
            ins.moveToTime({ ...args[0], type: 'abs' })
    } as CommandDescriptor<[RationalDef]>,
    { 
        argType: sequence<[number | undefined, number]>(['voice ', VoiceNoArg]), 
        action: (args: [[number | undefined, number]]) => {            
            const staff = args[0][0] ?? -1;
            return (model: Model, ins: InsertionPoint) => {
                ins.moveToVoice((staff < 0) ? ins.staffNo : staff - 1, args[0][1] - 1);
                return null;
            };
            //new GotoVoiceTextCommand(staff, args[0][1]).execute(model, ins);
        }
            
    } as CommandDescriptor<[[number | undefined, number]]>
];
/*
navigationCommands.forEach(cmd => {
    const args = cmd.argType.parse('vghj');
    cmd.action(args);
});
*/