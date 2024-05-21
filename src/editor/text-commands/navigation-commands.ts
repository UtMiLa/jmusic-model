import { RationalDef } from './../../model/rationals/rational';
import { VoiceNo, VoiceNoArg } from './argument-types';
import { ArgType, RationalArg, WhitespaceArg } from './base-argument-types';
import { sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Time, Model, EditableView } from './../../model';
import R = require('ramda');
import { commandDescriptor } from './edit-commands';

interface CommandDescriptor<T> {
    argType: ArgType<T>;
    action: (args: T) => (model: Model, ins: InsertionPoint) => void;
}

// goto AbsoluteTime
// goto next
// goto prev
// goto start


// voice StaffNo:VoiceNo


export const navigationCommands = [
    commandDescriptor(  
        (sequence(['goto', WhitespaceArg, 'next'])), 
        () => (model: EditableView, ins: InsertionPoint): void => ins.moveRight() 
    ),
    commandDescriptor(  
        (sequence(['goto', WhitespaceArg, 'prev'])), 
        () => (model: EditableView, ins: InsertionPoint): void => ins.moveLeft() 
    ),
    commandDescriptor(  
        (sequence<void>(['goto', WhitespaceArg, 'start'])), 
        () => (model: EditableView, ins: InsertionPoint): void => ins.moveToTime(Time.newAbsolute(0, 1)) 
    ),
    commandDescriptor(  
        (sequence<RationalDef>(['goto ', RationalArg])), 
        (args: [RationalDef]) => (model: EditableView, ins: InsertionPoint): void => 
            ins.moveToTime({ ...args[0], type: 'abs' })
    ),
    commandDescriptor(  
        (sequence<VoiceNo>(['voice ', (VoiceNoArg)])), 
        (args: [VoiceNo]) => {            
            const staff = args[0][0] ?? -1;
            return (model: EditableView, ins: InsertionPoint) => {
                ins.moveToVoice((staff < 0) ? ins.staffNo : staff - 1, args[0][1] - 1);
                return null;
            };
            //new GotoVoiceTextCommand(staff, args[0][1]).execute(model, ins);
        }
            
    )
];
/*
navigationCommands.forEach(cmd => {
    const args = cmd.argType.parse('vghj');
    cmd.action(args);
});
*/