import { BrowserPromptDialogProvider } from './../dialog/browser-prompt-dialog-provider';
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
        protected commandFactory: BaseCommandFactory, 
        protected commandExecuter: CommandExecuter,
        protected insertionPoint: InsertionPoint
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
        return false;
    }
    keyUp(keyName: string): boolean {
        return false;
    }
    async actionSelected(action: string, additionalArgs?: any[]): Promise<void> {

        const placeholderToArg = async (arg: any) => {
            if (typeof(arg === 'object') && arg.placeholder) {
                //console.log('arg.placeholder', arg);
                switch(arg.placeholder) {
                    case 'clef': return await dialogProvider.getClef();
                    case 'meter': return await dialogProvider.getMeter();
                    case 'key': return await dialogProvider.getKey();
                }
            }
            return arg;
        };


        const dialogProvider = new BrowserPromptDialogProvider();
        if (additionalArgs) {
            additionalArgs = await Promise.all(additionalArgs.map(placeholderToArg));
        }
        //
        //console.log('additionalArgs', additionalArgs);
        const cmd = this.commandFactory.createCommand(action, this.insertionPoint, additionalArgs);
        await this.commandExecuter.execute(cmd);
    }

}

