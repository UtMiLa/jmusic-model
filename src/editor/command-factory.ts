import { AddClefCommand, AddKeyCommand, AddMeterCommand, AlterPitchCommand, ChangePitchEnharmCommand, Command, DeleteNoteCommand, DeletePitchCommand, SetNoteDurationCommand, SetPitchCommand, SetPitchesCommand, ToggleNoteDotsCommand } from './commands';
import { InsertionPoint } from './insertion-point';

export type CommandType = typeof Command;



export class BaseCommandFactory {
    registry: { [key: string]: CommandType } = {
        'DeleteNote': DeleteNoteCommand,
        'DeletePitch': DeletePitchCommand,
        'SetPitch': SetPitchCommand,
        'SetPitches': SetPitchesCommand,
        'SetDuration': SetNoteDurationCommand,
        'SetDot': ToggleNoteDotsCommand,
        'EnharmPitch': ChangePitchEnharmCommand,
        'AlterPitch': AlterPitchCommand,
        'SetMeter': AddMeterCommand,
        'SetKey': AddKeyCommand,
        'SetClef': AddClefCommand
    };
    createCommand(id: string, insertionPoint: InsertionPoint, additionalArg: any[] = []): Command {
        return new this.registry[id]([insertionPoint, ...additionalArg]);
    }
}
