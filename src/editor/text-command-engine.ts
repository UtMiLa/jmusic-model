import { InsertionPoint } from './insertion-point';
import { Model } from '../model';
import R = require('ramda');
import { navigationCommands } from './text-commands/navigation-commands';
import { commandDescriptor, editCommands } from './text-commands/edit-commands';
import { matches } from './text-commands/base-argument-types';
import { either } from 'fp-ts';
import { Right } from 'fp-ts/lib/Either';

export interface TextCommand {
    execute(model: Model, ins: InsertionPoint): any;
}



export class CustomTextCommand<T> implements TextCommand {
    constructor(private f: (model: Model, ins: InsertionPoint) => T) { }

    execute(model: Model, ins: InsertionPoint): T {
        return this.f(model, ins);
    }
}

export class TextCommandEngine {
    static parse(command: string): TextCommand {
        const found = [...navigationCommands, ...editCommands]
            //.map(cmd => commandDescriptor(cmd.argType, cmd.action as any))
            .map(cmd => cmd(command))
            .find(cmd => either.isRight(cmd));
        if (found) {
            const res = found;
            if (either.isLeft(res)) throw new Error('Unknown command.');
            return new CustomTextCommand(res.right);
        }

        throw new Error('Unknown command.');
    }

}