import { InsertionPoint } from './insertion-point';

export type Command = { name: string } | undefined;

export class BaseCommandFactory {
    registry: { [key: string]: Command } = {
        'DeleteNote': { name: 'del note' },
        'DeletePitch': { name: 'del pitch' }
    };
    createCommand(id: string, insertionPoint: InsertionPoint, additionalArgs: any[] = []): Command {
        return this.registry[id];
    }
}
