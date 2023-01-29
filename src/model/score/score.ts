import { RepeatDef } from './repeats';
import { StaffDef } from './staff';
export interface ScoreDef {
    staves: StaffDef[]
    repeats?: RepeatDef[];
}

export function isScoreDef(item: unknown): item is ScoreDef {
    if (typeof (item) !== 'object') return false;
    if (typeof (item as ScoreDef).staves !== 'object') return false;
    if ((item as ScoreDef).staves.length === undefined) return false;
    if ((item as ScoreDef).staves.length > 0 && !(item as ScoreDef).staves[0].initialClef) return false;
    return true;
}
