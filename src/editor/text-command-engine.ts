import { AbsoluteTime, Time } from './../model/rationals/time';
import { InsertionPoint } from './insertion-point';
import { Model, ClefType, StaffDef, MultiSequenceDef, isSplitSequence, SplitSequenceDef, MultiSequenceItem } from '../model';
import R = require('ramda');
import { Command } from './commands';

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



export class AppendMusicCommand implements TextCommand {
    constructor(private items: string) { }

    execute(model: Model, ins: InsertionPoint): any {
        model.overProject(
            R.lensPath(['score', 'staves', ins.staffNo, 'voices', ins.voiceNo, 'contentDef']),
            (seq: MultiSequenceDef) => 
                R.cond<MultiSequenceDef, SplitSequenceDef, string, MultiSequenceItem[], MultiSequenceDef>([
                    [isSplitSequence, R.identity],
                    [R.is(String), (s: string) => (s + ' ' + this.items) as MultiSequenceDef],
                    [(R.is(Array<MultiSequenceItem>)), m => [...m, this.items]]
                ])(seq)
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
            if (/^goto +next$/.test(command)) return new CustomTextCommand((model, ins) => ins.moveRight());
            if (/^goto +prev$/.test(command)) return new CustomTextCommand((model, ins) => ins.moveLeft());
            if (/^goto +start$/.test(command)) return new CustomTextCommand((model, ins) => ins.moveToTime(Time.StartTime));
            
            const items = /^goto +(\d+)[\\/](\d+)/.exec(command);
            if (!items) throw new Error('Unknown command.');            
            const time = Time.newAbsolute(parseInt(items[1]), parseInt(items[2]));
            return new GotoTimeTextCommand(time);
        }
        if (/^add +staff$/.test(command)) { 
            return new AddStaffCommand();
        }
        if (/^append /.test(command)) { 
            return new AppendMusicCommand(command.substring('append '.length));
        }

        throw new Error('Unknown command.');
    }

}