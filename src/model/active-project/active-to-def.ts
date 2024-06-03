import R = require('ramda');
import { ignoreIfUndefined } from '../../tools/ignore-if-undefined';
import { ProjectDef } from '../data-only/project';
import { StaffDef, ScoreDef } from '../data-only/score';
import { VarDict } from '../data-only/variables';
import { VoiceDef } from '../data-only/voices';
import { flexibleItemToDef } from '../score/flexible-sequence';
import { FlexibleItem } from '../score/types';
import { convertSequenceDataToActive, convertActiveSequenceToData } from './conversions';
import { ActiveVarRepo, ActiveSequence, ActiveVoice, ActiveStaff, ActiveScore, ActiveProject } from './types';




export function convertVarDataToActive(vars: VarDict): ActiveVarRepo {
    return R.map((value: FlexibleItem) => convertSequenceDataToActive(flexibleItemToDef(value), vars), vars);
}

export function convertVarActiveToData(vars: ActiveVarRepo): VarDict {
    return R.map((value: ActiveSequence) => convertActiveSequenceToData(value), vars);
}
export function convertVoiceActiveToData(activeVoice: ActiveVoice): VoiceDef {
    return {
        contentDef: convertActiveSequenceToData(activeVoice.content),
        ...ignoreIfUndefined('noteDirection', activeVoice.noteDirection)
    };
}

export function convertStaffActiveToData(activeStaff: ActiveStaff): StaffDef {
    return {
        voices: activeStaff.voices.map(convertVoiceActiveToData),
        initialClef: activeStaff.initialClef.def,
        initialKey: activeStaff.initialKey.def,
        ...ignoreIfUndefined('initialMeter', activeStaff.initialMeter?.def)
    } as any;
}


export function convertScoreActiveToData(activeScore: ActiveScore): ScoreDef {
    return {
        staves: activeScore.staves.map(convertStaffActiveToData)
    };
}


export function convertProjectActiveToData(activeProject: ActiveProject): ProjectDef {
    return {
        score: convertScoreActiveToData(activeProject.score),
        vars: convertVarActiveToData(activeProject.vars)
    };
}




