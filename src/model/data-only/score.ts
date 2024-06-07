import { AbsoluteTime } from '../rationals/time';
import { ClefDef, KeyDef, MeterDef, RegularMeterDef } from './states';
import { VoiceDef } from './voices';

export interface StaffDef {
    initialClef: ClefDef;
    initialKey: KeyDef;
    initialMeter?: MeterDef;
    voices: VoiceDef[];
}

export interface RepeatDef {
    from: AbsoluteTime;
    to: AbsoluteTime;
}

export interface ScoreDef {
    staves: StaffDef[]
    repeats?: RepeatDef[];
}
