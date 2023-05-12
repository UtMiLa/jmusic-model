import { BaseCommandFactory } from './command-factory';
import { Command } from './commands';
import { InsertionPoint } from './insertion-point';

export interface CommandExecuter {
    execute(command: Command): void;
}

export interface EventHandler {
    noteDown(noteMidi: number): void;
    noteUp(noteMidi: number): void;
    keyDown(keyName: string): void;
    keyUp(keyName: string): void;
    actionSelected(action: string, additionalArgs?: any[]): void;
}

export class BaseEventHandler {
    constructor(
        private commandFactory: BaseCommandFactory, 
        private commandExecuter: CommandExecuter,
        private insertionPoint: InsertionPoint
    ) {}

    noteDown(noteMidi: number): void {
        //
    }
    noteUp(noteMidi: number): void {
        //
    }
    keyDown(keyName: string): void {
        //
    }
    keyUp(keyName: string): void {
        //
    }
    actionSelected(action: string, additionalArgs?: any[]): void {
        //
        const cmd = this.commandFactory.createCommand(action, this.insertionPoint, additionalArgs);
        this.commandExecuter.execute(cmd);
    }

}

