import { Time, TimeSpan } from './../rationals/time';
import { Key, KeyDef } from './key';
import { Clef, ClefDef } from './clef';
import { Meter, RegularMeterDef } from './meter';

export interface StateChangeDef {
    clef?: ClefDef;
    key?: KeyDef;
    meter?: RegularMeterDef;
}

export type StateChangeScope = number[] | undefined;

export class StateChange {
    clef?: Clef;
    key?: Key;
    meter?: Meter;
    isState = true;
    //scope: StateChangeScope;
}