import R = require('ramda');
import { JMusicSettings, JMusicVars, ScoreDef } from '..';
import { ProjectDef, FlexibleItem, isProjectDef } from '../score/types';
import { createRepo, varDefArrayToVarDict, varDictToVarDefArray } from '../score/variables';
import { ScoreFlex, makeScore } from './score-flex';

export type ProjectFlex = string | JMusicSettings | ScoreDef | ProjectDef;


export function makeProject(scoreFlex?: ScoreFlex, vars?: JMusicVars): ProjectDef {
    const vars1 = 
        vars
            ? R.toPairs<FlexibleItem>(vars).map(pair => ({ id: pair[0], value: pair[1] }))
            : isProjectDef(scoreFlex)
                ? varDictToVarDefArray(scoreFlex.vars)
                : [];

    const score = makeScore(scoreFlex, createRepo(vars1));

    return {
        score,
        vars: varDefArrayToVarDict(vars1)
    };
}
