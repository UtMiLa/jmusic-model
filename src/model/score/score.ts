import { RepeatDef } from './repeats';
import { Staff, StaffDef, staffDefToStaff } from './staff';
import { VariableRepository, createRepo } from './variables';
export interface ScoreDef {
    staves: StaffDef[]
    repeats?: RepeatDef[];
}

export interface Score {
    staves: Staff[]
    repeats?: RepeatDef[];
}

export function scoreDefToScore(def: ScoreDef, repo?: VariableRepository): Score {
    if (!repo) repo = createRepo({});
    return {
        repeats: def.repeats,
        staves: def.staves.map(sd => staffDefToStaff(sd, repo))
    };
}

export function isScoreDef(item: unknown): item is ScoreDef {
    if (typeof (item) !== 'object') return false;
    if (typeof (item as ScoreDef).staves !== 'object') return false;
    if ((item as ScoreDef).staves.length === undefined) return false;
    if ((item as ScoreDef).staves.length > 0 && !(item as ScoreDef).staves[0].initialClef) return false;
    return true;
}
