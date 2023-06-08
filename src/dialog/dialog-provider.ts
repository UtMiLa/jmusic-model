import { Clef, ClefDef, KeyDef, Meter, RegularMeterDef, ScoreDef } from './../model';

export interface DialogProvider {
    getKey(): Promise<KeyDef>;
    getClef(): Promise<ClefDef>;
    getMeter(): Promise<RegularMeterDef>;
    getNewScore(): Promise<ScoreDef>;
}