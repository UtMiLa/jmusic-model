import { InsertionPoint } from './insertion-point';
import { Model } from '../model';
import R = require('ramda');
import { navigationCommands } from './text-commands/navigation-commands';
import { editCommands } from './text-commands/edit-commands';

export interface TextCommand {
    execute(model: Model, ins: InsertionPoint): any;
}



export class CustomTextCommand implements TextCommand {
    constructor(private f: (model: Model, ins: InsertionPoint) => any) { }

    execute(model: Model, ins: InsertionPoint): any {
        return this.f(model, ins);
    }
}

export class TextCommandEngine {
    static parse(command: string): TextCommand {
        const found = [...navigationCommands, ...editCommands].find(elm => new RegExp(elm.argType.regex()).test(command));
        if (found) {
            const [parsed, rest] = found.argType.parse(command);
            if (rest.trim() !== '') throw 'Illegal command';
            const myFunc = found.action(parsed);
            return new CustomTextCommand(myFunc);
        }
        

        throw new Error('Unknown command.');
    }

}