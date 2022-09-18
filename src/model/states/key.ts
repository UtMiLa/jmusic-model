import { Alternation, Pitch, PitchClass } from './../pitches/pitch';

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