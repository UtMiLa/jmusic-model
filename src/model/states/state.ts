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

    static newMeterChange(meter: Meter): StateChange {
        const state = new StateChange();
        state.meter = meter;
        return state;
    }
    static newKeyChange(key: Key): StateChange {
        const state = new StateChange();
        state.key = key;
        return state;
    }
    static newClefChange(clef: Clef): StateChange {
        const state = new StateChange();
        state.clef = clef;
        return state;
    }
}