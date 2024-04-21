import { StateChange } from './../../model/states/state';
import { ClefArg, KeyArg, MeterArg, MusicEventArg } from './argument-types';
import { ArgType, ArgumentType, WhitespaceArg as W0, WordArg as Wo0, _eitherToException } from './base-argument-types';
import { many, sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Model, MultiSequenceDef, MultiSequenceItem, SplitSequenceDef, isSplitSequence, MusicEvent, FlexibleSequence, NoteDef, ClefType, StaffDef, isMeterChange, isClefChange, isKeyChange, FlexibleItem } from './../../model';
import R = require('ramda');

const WhitespaceArg = _eitherToException(W0);
const WordArg = _eitherToException(Wo0);

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

export const editCommands: CommandDescriptor<any>[] = [
   
    { 
        argType: _eitherToException(sequence(['append', WhitespaceArg, many(MusicEventArg)])), 
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
        argType: _eitherToException(sequence(['add', WhitespaceArg ,'staff'])),
        action: () => addStaff
    },
    { 
        argType: _eitherToException((sequence as (x: unknown) => ArgType<[StateChange]>)(['set', WhitespaceArg, 'key', WhitespaceArg, KeyArg])), 
        action: ([key]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, key, isKeyChange)
    } as CommandDescriptor<[StateChange]>,
    { 
        argType: _eitherToException((sequence as (x: unknown) => ArgType<[StateChange]>)(['set', WhitespaceArg, 'meter', WhitespaceArg, MeterArg])), 
        action: ([meter]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, meter, isMeterChange)
    } as CommandDescriptor<[StateChange]>,
    { 
        argType: _eitherToException((sequence as (x: unknown) => ArgType<[StateChange]>)(['set', WhitespaceArg, 'clef', WhitespaceArg, ClefArg])), 
        action: ([clef]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, clef, isClefChange)
    } as CommandDescriptor<[StateChange]>,
    { 
        argType: _eitherToException((sequence as (x: unknown) => ArgType<[string, FlexibleItem[]]>)([/\$/, WordArg, WhitespaceArg, '= ', many(MusicEventArg)])), 
        action: ([word, musicEvents]) => (model: Model, ins: InsertionPoint): void => model.setVar(word, musicEvents)
    } as CommandDescriptor<[string, FlexibleItem[]]>
];
