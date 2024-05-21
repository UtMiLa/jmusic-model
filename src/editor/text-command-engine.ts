import { SelectionManager } from './../selection/selection-types';
import { InsertionPoint } from './insertion-point';
import { EditableView, Model } from '../model';
import R = require('ramda');
import { navigationCommands } from './text-commands/navigation-commands';
import { editCommands } from './text-commands/edit-commands';
import { either } from 'fp-ts';
import { selectionCommands } from './text-commands/selection-commands';

export interface TextCommand {
    execute(model: EditableView, ins: InsertionPoint, selMan?: SelectionManager): any;
}



export class CustomTextCommand<T> implements TextCommand {
    constructor(private f: (model: EditableView, ins: InsertionPoint, selMan?: SelectionManager) => T) { }

    execute(model: EditableView, ins: InsertionPoint, selMan: SelectionManager): T {
        return this.f(model, ins, selMan);
    }
}

export class TextCommandEngine {
    static parse(command: string): TextCommand {
        const found = [...navigationCommands, ...editCommands, ...selectionCommands]
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