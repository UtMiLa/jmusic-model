import { Alteration, PitchClass } from '../pitches/pitch';
import { TimeSpan } from '../rationals/time';


export enum ClefType {
    G = 4,
    C = 0,
    F = -4
}

export interface ClefDef {
    clefType: ClefType;
    line: number;
    transpose?: number;
}


export interface DiatonicKeyDef {
    accidental: Alteration;
    count: number;
}

export interface IrregularKeyDef {
    alterations: PitchClass[];
}

export type KeyDef = IrregularKeyDef | DiatonicKeyDef;

export function isDiatonicKeyDef(input: any): input is DiatonicKeyDef {
    return typeof(input.count) === 'number';
}
export function isIrregularKeyDef(input: any): input is IrregularKeyDef {
    return input.alterations && input.alterations.length !== undefined;
}
export function isKeyDef(input: any): input is KeyDef {
    return isDiatonicKeyDef(input) || isIrregularKeyDef(input);
}

export interface RegularMeterDef {
    count: number;
    value: number;
    upBeat?: TimeSpan;
}

export interface CompositeMeterDef {
    meters: RegularMeterDef[];
    commonDenominator?: boolean;
}

export type MeterDef = RegularMeterDef | CompositeMeterDef;

export function isRegularMeterDef(input: any): input is RegularMeterDef {
    return !!input.count && !! input.value;
}

export function isCompositeMeterDef(input: any): input is CompositeMeterDef {
    return !!input.meters && !! input.meters.length && isRegularMeterDef(input.meters[0]);
}

export function isMeterDef(input: any): input is MeterDef {
    return isRegularMeterDef(input) || isCompositeMeterDef(input);
}

export interface StateChangeDef {
    clef?: ClefDef;
    key?: KeyDef;
    meter?: RegularMeterDef | CompositeMeterDef;
}
