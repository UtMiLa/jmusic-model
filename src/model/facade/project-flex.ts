import R = require('ramda');
import { JMusicSettings, ScoreDef, VarDictFlex } from '..';
import { ProjectDef, isProjectDef } from '..';
import { createRepo, varDictFlexToDef } from '../score/variables';
import { ScoreFlex, makeScore } from './score-flex';
import { normalizeVars } from '../active-project/conversions';

export type ProjectFlex = string | JMusicSettings | ScoreDef | ProjectDef;

export function makeProject(scoreFlex?: ScoreFlex, vars?: VarDictFlex): ProjectDef {
    const vars1 = vars ?? (isProjectDef(scoreFlex) ? scoreFlex.vars : {});


    const score = makeScore(scoreFlex, createRepo(varDictFlexToDef(vars1)));

    return {
        score,
        vars: normalizeVars(vars1)
    };
}
