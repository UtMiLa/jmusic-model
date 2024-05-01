import { Time } from '../../model';
import { SelectionAll, SelectionVoiceTime } from './../../selection/query';
import { Selection } from './../../selection/selection-types';
import { mapResult, select, sequence } from './argument-modifiers';
import { VoiceNoArg } from './argument-types';
import { ArgType, FixedArg } from './base-argument-types';



const SelectionAllArg: ArgType<Selection> = mapResult(FixedArg('all'), () => new SelectionAll());

const SelectionVoiceArg: ArgType<Selection> = mapResult(sequence(['voice ', VoiceNoArg]), (voiceIdent) => 
    new SelectionVoiceTime(voiceIdent[0][0] ?? 0, voiceIdent[0][1], Time.StartTime, Time.EternityTime));

export const SelectionArg: ArgType<Selection> = select([SelectionAllArg, SelectionVoiceArg]);
