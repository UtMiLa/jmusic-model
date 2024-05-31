import { ignoreIfUndefined } from '../../tools/ignore-if-undefined';
import { ProjectDef } from '../data-only/project';
import { StaffDef, ScoreDef } from '../data-only/score';
import { VarDict } from '../data-only/variables';
import { VoiceDef } from '../data-only/voices';
import { Clef } from '../states/clef';
import { Key } from '../states/key';
import { MeterFactory } from '../states/meter';
import { convertVarDataToActive } from './active-to-def';
import { convertSequenceDataToActive } from './conversions';
import { ActiveVarsAnd, ActiveVoice, ActiveStaff, ActiveScore, ActiveProject } from './types';

export function convertVoiceDataToActive(voiceDef: VoiceDef, vars: VarDict): ActiveVarsAnd<ActiveVoice> {
    return {
        item: { 
            content: convertSequenceDataToActive(voiceDef.contentDef, vars),
            ...ignoreIfUndefined('noteDirection', voiceDef.noteDirection)
        },
        vars: convertVarDataToActive(vars)
    };
}

export function convertStaffDataToActive(staffDef: StaffDef, vars: VarDict): ActiveVarsAnd<ActiveStaff> {
    return {
        item: {
            voices: staffDef.voices.map(voice => convertVoiceDataToActive(voice, vars).item),
            initialClef: new Clef(staffDef.initialClef),
            initialKey: new Key(staffDef.initialKey),
            ...ignoreIfUndefined('initialMeter', staffDef.initialMeter ? MeterFactory.createRegularMeter(staffDef.initialMeter) : undefined)
        },
        vars: convertVarDataToActive(vars)
    };
}


export function convertScoreDataToActive(scoreDef: ScoreDef, vars: VarDict): ActiveVarsAnd<ActiveScore> {
    return {
        item: {
            staves: scoreDef.staves.map(staff => convertStaffDataToActive(staff, vars).item)
        },
        vars: convertVarDataToActive(vars)
    };
}

export function convertProjectDataToActive(projectDef: ProjectDef): ActiveProject {
    return {
        score: convertScoreDataToActive(projectDef.score, projectDef.vars).item,
        vars: convertVarDataToActive(projectDef.vars)
    };
}

