import { AbsoluteTime, Time } from './../model/rationals/time';
import { InsertionPoint } from './insertion-point';
import { Model, ClefType, StaffDef, MultiSequenceDef, isSplitSequence, SplitSequenceDef, MultiSequenceItem } from '../model';
import R = require('ramda');
import { Command } from './commands';
import { navigationCommands } from './text-commands/navigation-commands';

export interface TextCommand {
    execute(model: Model, ins: InsertionPoint): any;
}



export class CustomTextCommand implements TextCommand {
    constructor(private f: (model: Model, ins: InsertionPoint) => any) { }

    execute(model: Model, ins: InsertionPoint): any {
        return this.f(model, ins);
    }
}

export class GotoVoiceTextCommand implements TextCommand {
    constructor(private staff: number, private voice: number) {}

    execute(model: Model, ins: InsertionPoint): any {
        ins.moveToVoice((this.staff < 0) ? ins.staffNo : this.staff - 1, this.voice - 1);
        return null;
    }
}

export class AddStaffCommand implements TextCommand {
    //constructor() { }

    execute(model: Model, ins: InsertionPoint): any {
        model.overProject(
            R.lensPath(['score', 'staves']),
            (staves: StaffDef[]) => [
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
        const found = [...navigationCommands].find(elm => new RegExp(elm.argType.regex()).test(command));
        if (found) {
            const [parsed, rest] = found.argType.parse(command);
            if (rest.trim() !== '') throw 'Illegal command';
            const myFunc = found.action(parsed as unknown as any);
            return new CustomTextCommand(myFunc);
        }

        if (/^voice/.test(command)) { 
            const items = /^voice +(\d+[:.])?(\d+)/.exec(command);
            if (!items) throw new Error('Unknown command.');
            const staff = items[1] ? parseInt(items[1]) : -1;
            return new GotoVoiceTextCommand(staff, parseInt(items[2]));
        }
        if (/^add +staff$/.test(command)) { 
            return new AddStaffCommand();
        }

        throw new Error('Unknown command.');
    }

}