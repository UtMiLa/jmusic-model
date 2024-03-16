import { Alteration } from '../pitches/pitch';
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


export interface KeyDef {
    accidental: Alteration;
    count: number;
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


export interface StateChangeDef {
    clef?: ClefDef;
    key?: KeyDef;
    meter?: RegularMeterDef | CompositeMeterDef;
}
