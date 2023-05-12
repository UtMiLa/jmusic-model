import { JMusic, getDotNumber, getDottedValue, getUndottedValue } from '../model';
import { InsertionPoint } from './insertion-point';


export class Command {
    constructor(protected args: [InsertionPoint, ...any]) {}
    execute(model: JMusic): void {
        //
    }
}

export class DeletePitchCommand extends Command {
    execute(model: JMusic): void {
        model.removePitch(this.args[0]);
    }
}

export class SetPitchCommand extends Command {
    execute(model: JMusic): void {
        model.addPitch(this.args[0]);
    }

}

export class DeleteNoteCommand extends Command {
    execute(model: JMusic): void {
        model.deleteNote(this.args[0]);
    }

}

export class SetNoteDurationCommand extends Command {
    execute(model: JMusic): void {
        model.setNoteValue(this.args[0], this.args[1]);
    }

}

export class ToggleNoteDotsCommand extends Command {
    execute(model: JMusic): void {
        const note = model.noteFromInsertionPoint(this.args[0]);

        const dots = getDotNumber(note.nominalDuration);
        const undotted = getUndottedValue(note.nominalDuration);
        const newDuration = getDottedValue(undotted, (dots + 1) % 4);
  
        model.setNoteValue(this.args[0], newDuration);

        //model.deleteNote(this.args[0]);
    }
}

export class ChangePitchEnharmCommand extends Command {
    execute(model: JMusic): void {
        model.changePitchEnharm(this.args[0]);
    }

}

export class AlterPitchCommand extends Command {
    execute(model: JMusic): void {
        model.alterPitch(this.args[0], this.args[1]);
    }

}

export class AddMeterCommand extends Command {
    execute(model: JMusic): void {
        model.addMeterChg(this.args[0], this.args[1]);
    }

}

export class AddClefCommand extends Command {
    execute(model: JMusic): void {
        model.addClefChg(this.args[0], this.args[1]);
    }

}

export class AddKeyCommand extends Command {
    execute(model: JMusic): void {
        model.addKeyChg(this.args[0], this.args[1]);
    }

}

