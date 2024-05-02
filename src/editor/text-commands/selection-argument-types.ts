import { AbsoluteTime, Model, Time } from '../../model';
import { InsertionPoint } from '../insertion-point';
import { SelectionAll, SelectionVoiceTime } from './../../selection/query';
import { Selection } from './../../selection/selection-types';
import { mapResult, select, sequence } from './argument-modifiers';
import { VoiceNo, VoiceNoArg } from './argument-types';
import { ArgType, FixedArg, IntegerArg, RationalArg, WhitespaceArg } from './base-argument-types';


export type ProtoSelection = (model: Model, insertionPoint: InsertionPoint) => Selection;

const protoSelectionAll: ProtoSelection = (model: Model, insertionPoint: InsertionPoint) => {
    return new SelectionAll();
};

const protoSelectionVoiceTime = (
    staffNo: number | 'this', 
    voiceNo: number | 'this', 
    fromTime: AbsoluteTime | 'this', 
    toTime: AbsoluteTime | 'this'
): ProtoSelection => (model: Model, insertionPoint: InsertionPoint) =>{
    const staffNo1 = staffNo === 'this' ? insertionPoint.staffNo : staffNo - 1;
    const voiceNo1 = voiceNo === 'this' ? insertionPoint.voiceNo : voiceNo - 1;
    const fromTime1 = fromTime === 'this' ? insertionPoint.time : fromTime;
    const toTime1 = toTime === 'this' ? insertionPoint.time : toTime;
    return new SelectionVoiceTime(model, staffNo1, voiceNo1, fromTime1, toTime1);
};


export const SelectionAllArg: ArgType<ProtoSelection> = mapResult(FixedArg('all'), () => protoSelectionAll);

/** voice 1:2   or   voice 2   or   voice this */
export const SelectionVoiceArg: ArgType<ProtoSelection> = mapResult(
    sequence([
        'voice ', 
        select([VoiceNoArg, FixedArg('this')])
    ]),
    ([voiceIdent]: [[number | undefined, number] | string]) => 
        typeof voiceIdent === 'string' 
            ? protoSelectionVoiceTime('this', 'this', Time.StartTime, Time.EternityTime) 
            : protoSelectionVoiceTime(voiceIdent[0] ?? 'this', voiceIdent[1], Time.StartTime, Time.EternityTime));

type TimeRestriction = AbsoluteTime | 'this';

export const NoTimeRestrictionArg: ArgType<[TimeRestriction, TimeRestriction]> = mapResult(FixedArg(''), () => {
    return [Time.StartTime, Time.EternityTime];
});
export const ToEndTimeRestrictionArg: ArgType<[TimeRestriction, TimeRestriction]> = mapResult(FixedArg(/to +end/), () => {
    return ['this', Time.EternityTime];
});
export const ToTimeRestrictionArg: ArgType<[TimeRestriction, TimeRestriction]> = mapResult(sequence(['to ', RationalArg]), rat => {
    return ['this', Time.EternityTime];
});
export const FromStartTimeRestrictionArg: ArgType<[TimeRestriction, TimeRestriction]> = mapResult(FixedArg(/from +start/), () => {
    return [Time.StartTime, Time.EternityTime];
});
export const FromTimeRestrictionArg: ArgType<[TimeRestriction, TimeRestriction]> = mapResult(sequence(['from ', RationalArg]), rat => {
    return [Time.StartTime, Time.EternityTime];
});

export const TimeRestrictionArg = select([FromTimeRestrictionArg, FromStartTimeRestrictionArg, ToEndTimeRestrictionArg, ToTimeRestrictionArg, NoTimeRestrictionArg]);

export const SelectionVoiceTimeArg: ArgType<ProtoSelection> = mapResult(
    sequence<VoiceNo | string, [TimeRestriction, TimeRestriction]>([
        'voice ', 
        select([VoiceNoArg, FixedArg('this')]),
        WhitespaceArg,
        TimeRestrictionArg
    ]),
    ([voiceIdent, timeRestriction]: [[number | undefined, number] | string, [TimeRestriction, TimeRestriction]]) => 
        typeof voiceIdent === 'string' 
            ? protoSelectionVoiceTime('this', 'this', timeRestriction[0], timeRestriction[1]) 
            : protoSelectionVoiceTime(voiceIdent[0] ?? 'this', voiceIdent[1], timeRestriction[0], timeRestriction[1]));


export const SelectionArg: ArgType<ProtoSelection> = select([SelectionAllArg, SelectionVoiceTimeArg, SelectionVoiceArg]);
