import { Time, TimeSpan } from './../rationals/time';
import { Key, KeyDef } from './key';
import { Clef, ClefDef } from './clef';
import { Meter, RegularMeterDef } from './meter';

export interface StateChangeDef {
    clef?: ClefDef;
    key?: KeyDef;
    meter?: RegularMeterDef;
    duration: TimeSpan;
}

export class StateChange {
    clef?: Clef;
    key?: Key;
    meter?: Meter;
    duration = Time.newSpan(0, 1);
    isState = true;
}