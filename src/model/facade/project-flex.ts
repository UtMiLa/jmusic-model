import R = require('ramda');
import { FlexibleSequence, JMusicSettings, ScoreDef } from '..';
import { ProjectDef, FlexibleItem, isProjectDef, VariableDef, VarDict } from '../score/types';
import { createRepo } from '../score/variables';
import { ScoreFlex, makeScore } from './score-flex';

export type ProjectFlex = string | JMusicSettings | ScoreDef | ProjectDef;

function normalizeSeq(val: FlexibleItem): FlexibleItem {
    return new FlexibleSequence(val).asObject;
}

function normalizeAllSeqs(val: VarDict): VarDict {
    return R.map(normalizeSeq, val);
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
        vars: vars1
    };
}
