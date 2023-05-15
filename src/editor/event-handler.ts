import { Time } from '../model';
import { BaseCommandFactory } from './command-factory';
import { Command } from './commands';
import { InsertionPoint } from './insertion-point';

export interface CommandExecuter {
    execute(command: Command): void;
}

export interface EventHandler {
    noteDown(noteMidi: number): void;
    noteUp(noteMidi: number): void;
    keyDown(keyName: string): boolean;
    keyUp(keyName: string): boolean;
    actionSelected(action: string, additionalArgs?: any[]): void;
}

export class BaseEventHandler {
    constructor(
        private commandFactory: BaseCommandFactory, 
        private commandExecuter: CommandExecuter,
        private insertionPoint: InsertionPoint
    ) {}

    noteDown(noteMidi: number): void {
        console.log('noteDown', noteMidi);
    }
    noteUp(noteMidi: number): void {
        console.log('noteUp', noteMidi);
    }
    keyDown(keyName: string): boolean {
        let cmd: Command | undefined;
        switch(keyName) {
            case 'Enter': cmd = this.commandFactory.createCommand('SetPitch', this.insertionPoint); break;
            case 'Delete': cmd = this.commandFactory.createCommand('DeletePitch', this.insertionPoint); break;
            case 'Backspace': cmd = this.commandFactory.createCommand('DeleteNote', this.insertionPoint); break;
            case '.': cmd = this.commandFactory.createCommand('SetDot', this.insertionPoint); break;
            case '+': cmd = this.commandFactory.createCommand('AlterPitch', this.insertionPoint, [1]); break;
            case '-': cmd = this.commandFactory.createCommand('AlterPitch', this.insertionPoint, [-1]); break;
            case '9': cmd = this.commandFactory.createCommand('EnharmPitch', this.insertionPoint); break;
            case '3': cmd = this.commandFactory.createCommand('SetPitch', this.insertionPoint, [Time.newSpan(1, 16)]); break;
            case '4': cmd = this.commandFactory.createCommand('SetPitch', this.insertionPoint, [Time.EightsTime]); break;
            case '5': cmd = this.commandFactory.createCommand('SetPitch', this.insertionPoint, [Time.QuarterTime]); break;
            case '6': cmd = this.commandFactory.createCommand('SetPitch', this.insertionPoint, [Time.HalfTime]); break;
            case '7': cmd = this.commandFactory.createCommand('SetDuration', this.insertionPoint, [Time.WholeTime]); break;

            case 'ArrowRight': this.insertionPoint.moveRight(); console.log('right', this.insertionPoint); return true;
            case 'ArrowLeft': this.insertionPoint.moveLeft(); console.log('left', this.insertionPoint); return true;
            case 'ArrowUp': this.insertionPoint.position++; console.log('++', this.insertionPoint); return true;
            case 'ArrowDown': this.insertionPoint.position--; console.log('--', this.insertionPoint); return true;

            default: return false;
        }
        if (cmd) {
            this.commandExecuter.execute(cmd);
            return true;
        }
        return false;
    }
    keyUp(keyName: string): boolean {
        return false;
    }
    actionSelected(action: string, additionalArgs?: any[]): void {
        //
        const cmd = this.commandFactory.createCommand(action, this.insertionPoint, additionalArgs);
        this.commandExecuter.execute(cmd);
    }

}

