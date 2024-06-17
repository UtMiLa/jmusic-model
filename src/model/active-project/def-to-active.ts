import { ignoreIfUndefined } from '../../tools/ignore-if-undefined';
import { ProjectDef } from '../data-only/project';
import { StaffDef, ScoreDef } from '../data-only/score';
import { VarDictDef } from '../data-only/variables';
import { VoiceDef } from '../data-only/voices';
import { Clef } from '../states/clef';
import { Key } from '../states/key';
import { Meter } from '../states/meter';
import { convertVarDataToActive } from './active-to-def';
import { convertSequenceDataToActive } from './conversions';
import { ActiveVarsAnd, ActiveVoice, ActiveStaff, ActiveScore, ActiveProject } from './types';

export function convertVoiceDataToActive(voiceDef: VoiceDef, vars: VarDictDef): ActiveVarsAnd<ActiveVoice> {
    return {
        item: { 
            content: convertSequenceDataToActive(voiceDef.contentDef, vars),
            ...ignoreIfUndefined('noteDirection', voiceDef.noteDirection)
        },
        vars: convertVarDataToActive(vars)
    };
}

export function convertStaffDataToActive(staffDef: StaffDef, vars: VarDictDef): ActiveVarsAnd<ActiveStaff> {
    return {
        item: {
            voices: staffDef.voices.map(voice => convertVoiceDataToActive(voice, vars).item),
            initialClef: Clef.create(staffDef.initialClef),
            initialKey: Key.create(staffDef.initialKey),
            ...ignoreIfUndefined('initialMeter', staffDef.initialMeter ? Meter.create(staffDef.initialMeter) : undefined)
        },
        vars: convertVarDataToActive(vars)
    };
}


export function convertScoreDataToActive(scoreDef: ScoreDef, vars: VarDictDef): ActiveVarsAnd<ActiveScore> {
    return {
        item: {
            staves: scoreDef.staves.map(staff => convertStaffDataToActive(staff, vars).item),
            ...ignoreIfUndefined('repeats', scoreDef.repeats)
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

