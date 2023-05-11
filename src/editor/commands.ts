import { JMusic } from '../model';
import { InsertionPoint } from './insertion-point';


export class Command {
    constructor(protected args: [InsertionPoint, any?]) {}
    execute(model: JMusic): void {
        //
    }
}

export class DeletePitchCommand extends Command {
    execute(model: JMusic): void {
        model.removePitch(this.args[0]);
    }
}

export class DeleteNoteCommand extends Command {
    execute(model: JMusic): void {
        model.deleteNote(this.args[0]);
    }

}