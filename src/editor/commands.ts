import { JMusic } from '../model';
import { InsertionPoint } from './insertion-point';

export class DeletePitchCommand {
    constructor(private args: [InsertionPoint]) {}
    execute(model: JMusic): void {
        model.removePitch(this.args[0]);
    }
}