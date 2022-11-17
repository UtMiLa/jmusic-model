import { RepeatDef } from './repeats';
import { StaffDef } from './staff';
export interface ScoreDef {
    staves: StaffDef[]
    repeats?: RepeatDef[];
}