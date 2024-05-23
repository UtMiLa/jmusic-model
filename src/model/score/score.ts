import { ignoreIfEmpty } from '../../tools/ignore-if-undefined';
import { ScoreDef } from './../data-only/score';
import { RepeatDef } from './repeats';
import { Staff, staffDefToStaff } from './staff';
import { VariableRepository, createRepo } from './variables';
/*export interface ScoreDef {
    staves: StaffDef[]
    repeats?: RepeatDef[];
}*/

export interface Score {
    staves: Staff[]
    repeats?: RepeatDef[];
}

export function scoreDefToScore(def: ScoreDef, repo?: VariableRepository): Score {
    if (!repo) repo = createRepo({});
    return {
        staves: def.staves.map(sd => staffDefToStaff(sd, repo)),
        ...ignoreIfEmpty('repeats', def.repeats)
    };
}

export function isScoreDef(item: unknown): item is ScoreDef {
    if (typeof (item) !== 'object') return false;
    if (typeof (item as ScoreDef).staves !== 'object') return false;
    if ((item as ScoreDef).staves.length === undefined) return false;
    if ((item as ScoreDef).staves.length > 0 && !(item as ScoreDef).staves[0].initialClef) return false;
    return true;
}
