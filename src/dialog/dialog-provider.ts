import { Clef, ClefDef, KeyDef, Meter, RegularMeterDef } from './../model';
import { Key } from './../model';
export interface DialogProvider {
    getKey(): Promise<KeyDef>;
    getClef(): Promise<ClefDef>;
    getMeter(): Promise<RegularMeterDef>;
}