import { StateChange } from './../../model/states/state';
import { ClefArg, KeyArg, MeterArg, MusicEventArg } from './argument-types';
import { ArgType, ResultAndRest, WhitespaceArg, WordArg } from './base-argument-types';
import { many, sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Model, MultiSequenceDef, MultiSequenceItem, SplitSequenceDef, isSplitSequence, MusicEvent, FlexibleSequence, NoteDef, ClefType, StaffDef, isMeterChange, isClefChange, isKeyChange, FlexibleItem } from './../../model';
import R = require('ramda');
import { Either } from 'fp-ts/lib/Either';
import { either } from 'fp-ts';


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
    argType: ArgType<T>;
    action: (args: T) => (model: Model, ins: InsertionPoint) => void;
}

export function commandDescriptor<T>(argType: ArgType<T>, action: (args: T) => (model: Model, ins: InsertionPoint) => any) {
    return (input: string) => {
        const match = argType(input);

        //if (either.isLeft(match)) return match;

        return either.map((x: ResultAndRest<T>) => action(x[0]))(match);
    };
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

export const editCommands = [
   
    commandDescriptor( 
        (sequence<MusicEvent[]>(['append', WhitespaceArg, many<any>(MusicEventArg)])), 
        (args: [MusicEvent[]]) => (model: Model, ins: InsertionPoint): void => {
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
    ),
    commandDescriptor( 
        (sequence(['add', WhitespaceArg ,'staff'])),
        () => addStaff
    ),
    commandDescriptor( 
        ((sequence as (x: unknown) => ArgType<[StateChange]>)(['set', WhitespaceArg, 'key', WhitespaceArg, KeyArg])), 
        ([key]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, key, isKeyChange)
    ),
    commandDescriptor( 
        ((sequence as (x: unknown) => ArgType<[StateChange]>)(['set', WhitespaceArg, 'meter', WhitespaceArg, MeterArg])), 
        ([meter]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, meter, isMeterChange)
    ),
    commandDescriptor( 
        ((sequence as (x: unknown) => ArgType<[StateChange]>)(['set', WhitespaceArg, 'clef', WhitespaceArg, ClefArg])), 
        ([clef]) => (model: Model, ins: InsertionPoint): void => model.insertElementAtInsertionPoint(ins, clef, isClefChange)
    ),
    commandDescriptor(  
        ((sequence as (x: unknown) => ArgType<[string, FlexibleItem[]]>)([/\$/, WordArg, WhitespaceArg, '= ', (many(MusicEventArg))])), 
        ([word, musicEvents]) => (model: Model, ins: InsertionPoint): void => model.setVar(word, musicEvents)
    )
];
