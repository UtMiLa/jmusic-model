import { Command, DeleteNoteCommand, DeletePitchCommand } from './commands';
import { InsertionPoint } from './insertion-point';

export type CommandType = typeof Command;



export class BaseCommandFactory {
    registry: { [key: string]: CommandType } = {
        'DeleteNote': DeleteNoteCommand,
        'DeletePitch': DeletePitchCommand
    };
    createCommand(id: string, insertionPoint: InsertionPoint, additionalArgs: any[] = []): Command {
        return new this.registry[id]([insertionPoint]);
    }
}
