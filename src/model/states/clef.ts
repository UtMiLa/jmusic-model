import { ClefDef, ClefType } from './../data-only/states';
import { mathMod } from 'ramda';
import { Pitch } from '../pitches/pitch';
/*export enum ClefType {
    G = 4,
    C = 0,
    F = -4
}

export interface ClefDef {
    clefType: ClefType;
    line: number;
    transpose?: number;
}*/

export class Clef {
    constructor(public def: ClefDef) {}

    get transposition(): number {
        return this.def.transpose || 0;
    }

    map(pitch: Pitch): number {
        return -this.def.clefType + this.def.line + pitch.diatonicNumber - this.transposition;
    }

    mapPosition(position: number): Pitch {
        
        const diatonicNumber = position + this.def.clefType - this.def.line + 4 * 7 + this.transposition;
        return new Pitch(mathMod(diatonicNumber, 7), Math.trunc(diatonicNumber / 7));
    }

    equals(clef: Clef): boolean {
        return this.def.clefType === clef.def.clefType && this.def.line === clef.def.line && this.transposition === clef.transposition;
    }
    
    static clefTreble = new Clef({ clefType: ClefType.G, line: -2 });
    static clefAlto = new Clef({ clefType: ClefType.C, line: 0 });
    static clefBass = new Clef({ clefType: ClefType.F, line: 2 });
    static clefTenor = new Clef({ clefType: ClefType.G, line: -2, transpose: -7 });
    static clefTenorC = new Clef({ clefType: ClefType.C, line: 2 });

}


export function clefToLilypond(clef: Clef): string {
    let clefTypeString: string;
    switch(clef.def.clefType) {
        case ClefType.C:            
            if (clef.def.line === 0) {
                clefTypeString = 'alto';
            } else
            if (clef.def.line === 2) {
                clefTypeString = 'tenor';
            } else throw 'Illegal clef';
            break;
        case ClefType.G: 
            clefTypeString = 'G';
            if (clef.def.line !== -2) throw 'Illegal clef';
            break;
        case ClefType.F: 
            clefTypeString = 'F';
            if (clef.def.line !== 2) throw 'Illegal clef';
            break;
    }

    let clefOctave = '';
    if (clef.def.transpose) {
        if (clef.def.transpose > 0) {
            const num = clef.def.transpose + 1;
            if (num !== 8 && num !== 15) throw 'Illegal clef transposition';
            clefOctave = '^' + num;
        } else {
            const num = 1 - clef.def.transpose;
            if (num !== 8 && num !== 15) throw 'Illegal clef transposition';
            clefOctave = '_' + num;
        }

    }

    return '\\clef ' + clefTypeString + clefOctave;
}