import { InsertionPoint } from './insertion-point';
import { Model } from '../model';

export interface TextCommand {
    execute(model: Model, ins: InsertionPoint): any;
}

export class GotoTextCommand implements TextCommand {
    constructor(private staff: number, private voice: number) {}

    execute(model: Model, ins: InsertionPoint): any {
        ins.moveToVoice((this.staff < 0) ? ins.staffNo : this.staff - 1, this.voice - 1);
        return null;
    }
}

export class TextCommandEngine {
    static parse(command: string): TextCommand {
        if (/^goto/.test(command)) { 
            const items = /^goto +(\d+[:.])?(\d+)/.exec(command);
            if (!items) throw new Error('Unknown command.');
            const staff = items[1] ? parseInt(items[1]) : -1;
            return new GotoTextCommand(staff, parseInt(items[2]));
        }

        throw new Error('Unknown command.');
    }

}