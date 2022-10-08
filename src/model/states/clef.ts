import { Pitch } from '../pitches/pitch';
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


    static clefTreble = new Clef({ clefType: ClefType.G, line: -2 });
    static clefAlto = new Clef({ clefType: ClefType.C, line: 0 });
    static clefBass = new Clef({ clefType: ClefType.F, line: 2 });
    static clefTenor = new Clef({ clefType: ClefType.G8, line: -2 });
    static clefTenorC = new Clef({ clefType: ClefType.C, line: 2 });

}
