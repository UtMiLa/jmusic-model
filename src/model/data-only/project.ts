import { VarDictDef } from './variables';
import { ScoreDef } from './score';

export interface ProjectDef {
    score: ScoreDef;
    vars: VarDictDef;
}

export function isProjectDef(test: unknown): test is ProjectDef {
    return !!test && !!(test as ProjectDef).score && !!(test as ProjectDef).vars;
}
