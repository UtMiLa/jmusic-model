import { StateChange } from './../../model/states/state';
import { RationalDef } from './../../model/rationals/rational';
import { ClefArg, KeyArg, MeterArg, MusicEventArg, VoiceNoArg } from './argument-types';
import { ArgumentType, RationalArg, WhitespaceArg } from './base-argument-types';
import { many, sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Time, Model, MultiSequenceDef, MultiSequenceItem, SplitSequenceDef, isSplitSequence, MusicEvent, FlexibleSequence, NoteDef, ClefType, StaffDef, Meter, isMeterChange, isClefChange, isKeyChange } from './../../model';
import R = require('ramda');
import { AddMeterCommand } from '../commands';



function addStaff(model: Model, ins: InsertionPoint): any {
    model.overProject(
        R.lensPath(['score', 'staves']),
        (staves: StaffDef[]) => [
            ...staves,

            {
                initialClef: { clefType: ClefType.F, line: 2 },
                initialKey: { accidental: 0, count: 0 },
                initialMeter: { count: 4, value: 4 },
                voices: [
    
                ]
    
            } as StaffDef
        ]
    );
    return null;
}




interface CommandDescriptor<T> {
    argType: ArgumentType<T>;
    action: (args: T) => (model: Model, ins: InsertionPoint) => void;
}

// goto AbsoluteTime
// goto next
// goto prev
// goto start


// voice StaffNo:VoiceNo

// append Some(MusicElement)

// set key Key
// set clef Clef
// set meter Meter

export const navigationCommands: CommandDescriptor<any>[] = [
    { 
        argType: sequence(['goto', WhitespaceArg, 'next']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveRight() 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence(['goto', WhitespaceArg, 'prev']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveLeft() 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence<void>(['goto', WhitespaceArg, 'start']), 
        action: () => (model: Model, ins: InsertionPoint): void => ins.moveToTime(Time.newAbsolute(0, 1)) 
    } as CommandDescriptor<[void]>,
    { 
        argType: sequence<RationalDef>(['goto', WhitespaceArg, RationalArg]), 
        action: (args: [RationalDef]) => (model: Model, ins: InsertionPoint): void => 
            ins.moveToTime({ ...args[0], type: 'abs' })
    } as CommandDescriptor<[RationalDef]>,
    { 
        argType: sequence<[number | undefined, number]>(['voice', WhitespaceArg, VoiceNoArg]), 
        action: (args: [[number | undefined, number]]) => {            
            const staff = args[0][0] ?? -1;
            return (model: Model, ins: InsertionPoint) => {
                ins.moveToVoice((staff < 0) ? ins.staffNo : staff - 1, args[0][1] - 1);
                return null;
            };
            //new GotoVoiceTextCommand(staff, args[0][1]).execute(model, ins);
        }
            
    } as CommandDescriptor<[[number | undefined, number]]>,
    { 
        argType: sequence(['append', WhitespaceArg, many(MusicEventArg)]), 
        action: (args: [MusicEvent[]]) => (model: Model, ins: InsertionPoint): void => {
            const events = args[0];
            const eventDef = new FlexibleSequence(events).def;
            model.overProject(
                R.lensPath(['score', 'staves', ins.staffNo, 'voices', ins.voiceNo, 'contentDef']),
                (seq: MultiSequenceDef) => 
                    R.cond<MultiSequenceDef, SplitSequenceDef, string, MultiSequenceItem[], MultiSequenceDef>([
                        [isSplitSequence, R.identity],
                        [R.is(String), (s: string) => (s + ' ' + eventDef) as MultiSequenceDef],
                        [(R.is(Array<MultiSequenceItem>)), m => [...m, eventDef as NoteDef[]]] // todo: fix ugly cast
                    ])(seq)
            );
        }
    } as CommandDescriptor<[MusicEvent[]]>,
    {
        argType: sequence(['add', WhitespaceArg ,'staff']),
        action: () => addStaff
    },
    { 
        argType: (sequence as (x: unknown) => ArgumentType<[StateChange]>)(['set', WhitespaceArg, 'key', WhitespaceArg, KeyArg]), 
        action: ([key]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, key, isKeyChange)
    } as CommandDescriptor<[StateChange]>,
    { 
        argType: (sequence as (x: unknown) => ArgumentType<[StateChange]>)(['set', WhitespaceArg, 'meter', WhitespaceArg, MeterArg]), 
        action: ([meter]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, meter, isMeterChange)
    } as CommandDescriptor<[StateChange]>,
    { 
        argType: (sequence as (x: unknown) => ArgumentType<[StateChange]>)(['set', WhitespaceArg, 'clef', WhitespaceArg, ClefArg]), 
        action: ([clef]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, clef, isClefChange)
    } as CommandDescriptor<[StateChange]>
];
/*
navigationCommands.forEach(cmd => {
    const args = cmd.argType.parse('vghj');
    cmd.action(args);
});
*/