import R = require('ramda');
import { JMusicSettings, ScoreDef } from '..';
import { ProjectDef, FlexibleItem, isProjectDef, VariableDef, VarDict } from '../score/types';
import { createRepo } from '../score/variables';
import { ScoreFlex, makeScore } from './score-flex';

export type ProjectFlex = string | JMusicSettings | ScoreDef | ProjectDef;


export function makeProject(scoreFlex?: ScoreFlex, vars?: VarDict): ProjectDef {
    const vars1 = 
        vars
            ? vars
            : isProjectDef(scoreFlex)
                ? scoreFlex.vars
                : {};

    const score = makeScore(scoreFlex, createRepo(vars1));

    return {
        score,
        vars: vars1
    };
}
