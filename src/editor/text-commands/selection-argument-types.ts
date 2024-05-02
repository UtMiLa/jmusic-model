import { AbsoluteTime, Model, Time } from '../../model';
import { InsertionPoint } from '../insertion-point';
import { SelectionAll, SelectionVoiceTime } from './../../selection/query';
import { Selection } from './../../selection/selection-types';
import { mapResult, select, sequence } from './argument-modifiers';
import { VoiceNoArg } from './argument-types';
import { ArgType, FixedArg } from './base-argument-types';


export interface ProtoSelection {
    actuate(model: Model, insertionPoint: InsertionPoint): Selection;
}

class ProtoSelectionAll implements ProtoSelection {
    actuate(model: Model, insertionPoint: InsertionPoint) {
        return new SelectionAll();
    }
}

class ProtoSelectionVoiceTime implements ProtoSelection {
    constructor(
        private staffNo: number | 'this', 
        private voiceNo: number | 'this', 
        private fromTime: AbsoluteTime | 'this', 
        private toTime: AbsoluteTime | 'this'
    ) {}

    actuate(model: Model, insertionPoint: InsertionPoint) {
        const staffNo = this.staffNo === 'this' ? insertionPoint.staffNo : this.staffNo;
        const voiceNo = this.voiceNo === 'this' ? insertionPoint.voiceNo : this.voiceNo;
        const fromTime = this.fromTime === 'this' ? insertionPoint.time : this.fromTime;
        const toTime = this.toTime === 'this' ? insertionPoint.time : this.toTime;
        return new SelectionVoiceTime(model, staffNo, voiceNo, fromTime, toTime);
    }
}

const SelectionAllArg: ArgType<ProtoSelection> = mapResult(FixedArg('all'), () => new ProtoSelectionAll());

const SelectionVoiceArg: ArgType<ProtoSelection> = mapResult(sequence(['voice ', VoiceNoArg]), (voiceIdent) => 
    new ProtoSelectionVoiceTime(voiceIdent[0][0] ?? 0, voiceIdent[0][1], Time.StartTime, Time.EternityTime));

export const SelectionArg: ArgType<ProtoSelection> = select([SelectionAllArg, SelectionVoiceArg]);
