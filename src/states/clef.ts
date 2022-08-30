import { Pitch } from './../pitches/pitch';
export enum ClefType {
    G = 4,
    C = 0,
    F = -4,
    G8 = -3
}

export interface ClefDef {
    clefType: ClefType;
    line: number;
}

export class Clef {
    constructor(public def: ClefDef) {}

    map(pitch: Pitch): number {
        return -this.def.clefType + this.def.line + pitch.diatonicNumber;
    }
}