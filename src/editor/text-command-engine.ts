import { AbsoluteTime, Time } from './../model/rationals/time';
import { InsertionPoint } from './insertion-point';
import { ClefType, Model, StaffDef } from '../model';
import R = require('ramda');

export interface TextCommand {
    execute(model: Model, ins: InsertionPoint): any;
}

export class GotoVoiceTextCommand implements TextCommand {
    constructor(private staff: number, private voice: number) {}

    execute(model: Model, ins: InsertionPoint): any {
        ins.moveToVoice((this.staff < 0) ? ins.staffNo : this.staff - 1, this.voice - 1);
        return null;
    }
}


export class GotoTimeTextCommand implements TextCommand {
    constructor(private time: AbsoluteTime) {}

    execute(model: Model, ins: InsertionPoint): any {
        ins.moveToTime(this.time);        
        return null;
    }
}


export class AddStaffCommand implements TextCommand {
    //constructor() { }

    execute(model: Model, ins: InsertionPoint): any {
        model.overProject(
            R.lensPath(['score', 'staves']),
            staves => [
                ...staves,

                {
                    initialClef: { clefType: ClefType.F, line: 2 },
                    initialKey: { accidental: 0, count: 0 },
                    initialMeter: { count: 4, value: 4 },
                    voices: [
        
                    ]
        
                } as StaffDef
            ]
        );
        return null;
    }
}



export class TextCommandEngine {
    static parse(command: string): TextCommand {
        if (/^voice/.test(command)) { 
            const items = /^voice +(\d+[:.])?(\d+)/.exec(command);
            if (!items) throw new Error('Unknown command.');
            const staff = items[1] ? parseInt(items[1]) : -1;
            return new GotoVoiceTextCommand(staff, parseInt(items[2]));
        }
        if (/^goto/.test(command)) { 
            const items = /^goto +(\d+)[\\/](\d+)/.exec(command);
            if (!items) throw new Error('Unknown command.');            
            const time = Time.newAbsolute(parseInt(items[1]), parseInt(items[2]));
            return new GotoTimeTextCommand(time);
        }
        if (/^add +staff$/.test(command)) { 
            return new AddStaffCommand();
        }

        throw new Error('Unknown command.');
    }

}