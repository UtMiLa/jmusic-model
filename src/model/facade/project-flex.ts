import R = require('ramda');
import { JMusicSettings, ScoreDef, flexibleItemToDef } from '..';
import { ProjectDef, FlexibleItem, isProjectDef, VariableDef, VarDict } from '..';
import { VariableRepository, VariableRepositoryProxy, createRepo } from '../score/variables';
import { ScoreFlex, makeScore } from './score-flex';
import { normalizeVars } from '../object-model-functional/conversions';

export type ProjectFlex = string | JMusicSettings | ScoreDef | ProjectDef;

function normalizeSeq(val: FlexibleItem): FlexibleItem {
    return flexibleItemToDef(val);
}

function normalizeAllSeqs(val: VarDict): VarDict {
    return R.map(v => normalizeSeq(v), val);
}

export function makeProject(scoreFlex?: ScoreFlex, vars?: VarDict): ProjectDef {
    const vars1 = 
        vars
            ? normalizeAllSeqs(vars)
            : isProjectDef(scoreFlex)
                ? scoreFlex.vars
                : {};

    const score = makeScore(scoreFlex, createRepo(vars1));

    return {
        score,
        vars: normalizeVars(vars1)
    };
}
