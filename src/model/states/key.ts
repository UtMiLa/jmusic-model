import { Alternation, Pitch, PitchClass, Accidental } from './../pitches/pitch';

export interface KeyDef {
    accidental: Alternation;
    count: number;
}

export class Key {
    constructor(public def: KeyDef) {}

    *enumerate(): Generator<PitchClass, void, unknown> {
        let pc = this.def.accidental === 1 ? 3 : 6;
        const step = this.def.accidental === 1 ? 4 : 3;
        for(let i = 0; i < this.def.count; i++) {
            yield new PitchClass(pc, this.def.accidental);
            pc += step;
            pc %= 7;
        }        

    }

}

export class AccidentalManager {
    private _key: Key | undefined;
    private rememberPitches: { [key: number]: Accidental } = {};
    private rememberPitchClasses: { [key: number]: Accidental } = {};

    newBar(): void {
        this.rememberPitches = {};
        this.rememberPitchClasses = {};
    }
    getAccidental(pitch: Pitch): Accidental {
        let res: Accidental = pitch.alternation;

        const alreadyThere = this.rememberPitches[pitch.diatonicNumber];

        if (alreadyThere !== undefined) {
            if (alreadyThere === res) {
                return undefined;
            } else {
                if (!res) res = 0;
            }
        } else {

            const pitchClassAlreadyThere = this.rememberPitchClasses[pitch.pitchClass];
            //console.log(pitchClassAlreadyThere, this.rememberPitchClasses, pitch.pitchClass);
            
            if (pitchClassAlreadyThere !== undefined) {
                if (!res) res = 0;
            } else if (this._key) { 
                const fixed = Array.from<PitchClass>(this._key.enumerate());
                //console.log(fixed, pitch.pitchClass);
                
                const keyAcc = fixed.find((fix: PitchClass) => fix.pitchClass === pitch.pitchClass);
                if (keyAcc) {
                    if (res === keyAcc.alternation) return undefined;
                } else if (res === 0) res = undefined;
            }
            else if (res === 0) res = undefined;            
        }

        this.rememberPitches[pitch.diatonicNumber] = res;
        this.rememberPitchClasses[pitch.pitchClass] = res;
        return res;
    }
    setKey(key: Key): void {
        this._key = key;
    }

}