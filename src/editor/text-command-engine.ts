import { AbsoluteTime, Time } from './../model/rationals/time';
import { InsertionPoint } from './insertion-point';
import { Model } from '../model';

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

        throw new Error('Unknown command.');
    }

}