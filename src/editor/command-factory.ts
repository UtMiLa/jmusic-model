import { AddClefCommand, AddKeyCommand, AddMeterCommand, AddNoteCommand, AlterPitchCommand, ChangePitchEnharmCommand, Command, DeleteNoteCommand, DeletePitchCommand, FileNewCommand, SetNoteDurationCommand, SetPitchCommand, SetPitchesCommand, ToggleNoteDotsCommand } from './commands';
import { InsertionPoint } from './insertion-point';

export type CommandType = typeof Command;

interface CommandRegistration {
    command: CommandType;
    atNote?: boolean;
    atEnd?: boolean;
}


export class BaseCommandFactory {
    registry: { [key: string]: CommandRegistration } = {
        'AddNote': { command: AddNoteCommand, atNote: false, atEnd: true },
        'DeleteNote': { command: DeleteNoteCommand, atNote: true, atEnd: false },
        'DeletePitch': { command: DeletePitchCommand, atNote: true, atEnd: false },
        'SetPitch': { command: SetPitchCommand, atNote: true, atEnd: false },
        'SetPitches': { command: SetPitchesCommand, atNote: true, atEnd: false },
        'SetDuration': { command: SetNoteDurationCommand, atNote: true, atEnd: false },
        'SetDot': { command: ToggleNoteDotsCommand, atNote: true, atEnd: false },
        'EnharmPitch': { command: ChangePitchEnharmCommand, atNote: true, atEnd: false },
        'AlterPitch': { command: AlterPitchCommand, atNote: true, atEnd: false },
        'SetMeter': { command: AddMeterCommand, atNote: true, atEnd: false },
        'SetKey': { command: AddKeyCommand, atNote: true, atEnd: false },
        'SetClef': { command: AddClefCommand, atNote: true, atEnd: false },
        'NewFile': { command: FileNewCommand, atNote: true, atEnd: true }
    };
    createCommand(id: string, insertionPoint: InsertionPoint, additionalArg: any[] = []): Command {
        const cmdReg =  this.registry[id]; 
        if (!cmdReg || (insertionPoint.isAtEnd() && ! cmdReg.atEnd) )
            throw 'Illegal command';
        return new cmdReg.command([insertionPoint, ...additionalArg]);
    }
}
