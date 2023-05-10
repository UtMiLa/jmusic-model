import { BaseCommandFactory, Command } from './command-factory';
import { InsertionPoint } from './insertion-point';

export interface CommandExecuter {
    execute(command: Command): void;
}

export interface EventHandler {
    noteDown(noteMidi: number): void;
    noteUp(noteMidi: number): void;
    keyDown(keyName: string): void;
    keyUp(keyName: string): void;
    actionSelected(action: string): void;
}

export class BaseEventHandler {
    constructor(private commandFactory: BaseCommandFactory, private commandExecuter: CommandExecuter) {}

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
    actionSelected(action: string): void {
        //
        const cmd = this.commandFactory.createCommand(action, new InsertionPoint({staves: []}));
        this.commandExecuter.execute(cmd);
    }

}

