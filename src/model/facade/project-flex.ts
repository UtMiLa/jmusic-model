import R = require('ramda');
import { FlexibleSequence, JMusicSettings, ScoreDef } from '..';
import { ProjectDef, FlexibleItem, isProjectDef, VariableDef, VarDict } from '..';
import { VariableRepository, VariableRepositoryProxy, createRepo } from '../score/variables';
import { ScoreFlex, makeScore } from './score-flex';

export type ProjectFlex = string | JMusicSettings | ScoreDef | ProjectDef;

function normalizeSeq(val: FlexibleItem, repo: VariableRepository): FlexibleItem {
    return new FlexibleSequence(val, repo).asObject;
}

function normalizeAllSeqs(val: VarDict, repo: VariableRepository): VarDict {
    return R.map(v => normalizeSeq(v, repo), val);
}

export function makeProject(scoreFlex?: ScoreFlex, vars?: VarDict): ProjectDef {
    const varProxy = new VariableRepositoryProxy();


    //console.log('makeProject');
    

    const vars1 = 
        vars
            ? normalizeAllSeqs(vars, varProxy)
            : isProjectDef(scoreFlex)
                ? scoreFlex.vars
                : {};

    varProxy.assignVarDict(vars1);

    const score = makeScore(scoreFlex, varProxy);

    return {
        score,
        vars: vars1
    };
}
