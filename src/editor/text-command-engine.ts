import { SelectionManager } from './../selection/selection-types';
import { InsertionPoint } from './insertion-point';
import { EditableView, Model } from '../model';
import R = require('ramda');
import { navigationCommands } from './text-commands/navigation-commands';
import { commandDescriptor, editCommands } from './text-commands/edit-commands';
import { either } from 'fp-ts';
import { selectionCommands } from './text-commands/selection-commands';
import { FixedArg } from './text-commands/base-argument-types';

export interface TextCommand {
    execute(model: EditableView, ins: InsertionPoint, selMan?: SelectionManager): any;
}



export class CustomTextCommand<T> implements TextCommand {
    constructor(private f: (model: EditableView, ins: InsertionPoint, selMan?: SelectionManager) => T) { }

    execute(model: EditableView, ins: InsertionPoint, selMan: SelectionManager): T {
        return this.f(model, ins, selMan);
    }
}

const helpCommand = commandDescriptor(  
    (FixedArg('help')),
    () => (): string => `
help    this helptext
goto [locator]  move cursor to [locator], which can be next, prev, start or an absolute time e.g. 4/1
voice [#staff]:[#voice] move cursor to the given voice
voice [#voice] move cursor to the given voice in the same staff

append [music]  append the parsed music to the end of the current voice
add staff   adds an empty staff
set key [key]   sets a key change at cursor - key is a number and x or b, e.g. 4b
set clef [clef] sets a clef change at cursor - clef is bass, treble, alto, tenor
set meter [meter]   sets a meter change at cursor - meter is e.g. 3/4

select clear    select nothing
select [set|also|restrict|except] [query]   
selection [expr]    adds expression to all notes in selection

    [query] can be 'all', 'voice [#voice]', 'voice this', and an optional 
    time restriction, e.g. 'from start to this'

$[variable] = [music]   sets a variable
`
);

export class TextCommandEngine {
    static parse(command: string): TextCommand {
        const found = [helpCommand, ...navigationCommands, ...editCommands, ...selectionCommands]
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