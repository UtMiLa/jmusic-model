import R = require('ramda');
import { JMusicSettings, ScoreDef, flexibleItemToDef } from '..';
import { ProjectDef, FlexibleItem, isProjectDef, VariableDef, VarDict } from '..';
import { VariableRepository, VariableRepositoryProxy, createRepo } from '../score/variables';
import { ScoreFlex, makeScore } from './score-flex';
import { normalizeVars } from '../active-project/conversions';

export type ProjectFlex = string | JMusicSettings | ScoreDef | ProjectDef;

export function makeProject(scoreFlex?: ScoreFlex, vars?: VarDict): ProjectDef {
    const vars1 = vars ?? (isProjectDef(scoreFlex) ? scoreFlex.vars : {});


    const score = makeScore(scoreFlex, createRepo(vars1));

    return {
        score,
        vars: normalizeVars(vars1)
    };
}
