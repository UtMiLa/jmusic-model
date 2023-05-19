import { Subject } from 'rxjs';
import { Time } from '../model';
import { BaseCommandFactory } from './command-factory';
import { Command } from './commands';
import { InsertionPoint } from './insertion-point';
import R = require('ramda');

export interface CommandExecuter {
    execute(command: Command): void;
}

export interface EventHandler {
    noteDown(noteMidi: number): void;
    noteUp(noteMidi: number): void;
    keyDown(keyName: string): boolean;
    keyUp(keyName: string): boolean;
    actionSelected(action: string, additionalArgs?: any[]): void;
    onChordChange(handler: (noteMidi: number[]) => void): void;
}

export class BaseEventHandler {
    constructor(
        private commandFactory: BaseCommandFactory, 
        private commandExecuter: CommandExecuter,
        private insertionPoint: InsertionPoint
    ) {}

    $noteChange = new Subject<number>();
    //pressed: boolean[] = [];
    keysPressed: number[] = [];

    onNoteDown(handler: (noteMidi: number) => void): void {
        this.$noteChange.subscribe(handler);
    }
    onChordChange(handler: (noteMidi: number[]) => void): void {
        //this.$noteChange.subscribe(() => handler(this.pressed.map((v, i) => [v, i]).filter(([v, i]) => v).map(([v, i]) => i as number)));
        this.$noteChange.subscribe(() => handler(this.keysPressed));
    }
    noteDown(noteMidi: number): void {
        //console.log('noteDown', noteMidi);
        //this.pressed[noteMidi] = true;
        this.keysPressed = R.union(this.keysPressed, [noteMidi]);
        this.$noteChange.next(noteMidi);
    }
    noteUp(noteMidi: number): void {
        //console.log('noteUp', noteMidi);
        //this.pressed[noteMidi] = false;
        this.keysPressed = R.difference(this.keysPressed, [noteMidi]);
        this.$noteChange.next(noteMidi);
    }
    keyDown(keyName: string): boolean {
        let cmd: Command | undefined;
        if (this.insertionPoint.isAtEnd()) {
            // at end of voice
            switch(keyName) {
                case '3': cmd = this.commandFactory.createCommand('AddNote', this.insertionPoint, [this.keysPressed, Time.newSpan(1, 16)]); break;
                case '4': cmd = this.commandFactory.createCommand('AddNote', this.insertionPoint, [this.keysPressed, Time.EightsTime]); break;
                case '5': cmd = this.commandFactory.createCommand('AddNote', this.insertionPoint, [this.keysPressed, Time.QuarterTime]); break;
                case '6': cmd = this.commandFactory.createCommand('AddNote', this.insertionPoint, [this.keysPressed, Time.HalfTime]); break;
                case '7': cmd = this.commandFactory.createCommand('AddNote', this.insertionPoint, [this.keysPressed, Time.WholeTime]); break;
            }
        } else {
            if (this.keysPressed.length) {
                // Notes are pressed on MIDI keyboard (or emulator)
                switch(keyName) {
                    case 'Enter': 
                        cmd = this.commandFactory.createCommand('SetPitches', this.insertionPoint, [this.keysPressed]); 
                        break;
                }
            } else {
                switch(keyName) {
                    case 'Enter': 
                        cmd = this.commandFactory.createCommand('SetPitch', this.insertionPoint); 
                        break;
                    case 'Delete': cmd = this.commandFactory.createCommand('DeletePitch', this.insertionPoint); break;
                    case 'Backspace': cmd = this.commandFactory.createCommand('DeleteNote', this.insertionPoint); break;
                    case '.': cmd = this.commandFactory.createCommand('SetDot', this.insertionPoint); break;
                    case '+': cmd = this.commandFactory.createCommand('AlterPitch', this.insertionPoint, [1]); break;
                    case '-': cmd = this.commandFactory.createCommand('AlterPitch', this.insertionPoint, [-1]); break;
                    case '9': cmd = this.commandFactory.createCommand('EnharmPitch', this.insertionPoint); break;
                    case '3': cmd = this.commandFactory.createCommand('SetDuration', this.insertionPoint, [Time.newSpan(1, 16)]); break;
                    case '4': cmd = this.commandFactory.createCommand('SetDuration', this.insertionPoint, [Time.EightsTime]); break;
                    case '5': cmd = this.commandFactory.createCommand('SetDuration', this.insertionPoint, [Time.QuarterTime]); break;
                    case '6': cmd = this.commandFactory.createCommand('SetDuration', this.insertionPoint, [Time.HalfTime]); break;
                    case '7': cmd = this.commandFactory.createCommand('SetDuration', this.insertionPoint, [Time.WholeTime]); break;

                    case 'ArrowRight': this.insertionPoint.moveRight(); return true;
                    case 'ArrowLeft': this.insertionPoint.moveLeft(); return true;
                    case 'ArrowUp': this.insertionPoint.position++; return true;
                    case 'ArrowDown': this.insertionPoint.position--; return true;

                    default: return false;
                }
            }
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

