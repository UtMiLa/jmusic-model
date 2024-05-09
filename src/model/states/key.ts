import { KeyDef } from './../data-only/states';
import { add, mathMod, multiply, pipe, range, times, __ } from 'ramda';
import { Alteration, Pitch, PitchClass, Accidental } from './../pitches/pitch';

/*export interface KeyDef {
    accidental: Alteration;
    count: number;
}*/

export class Key {
    constructor(public def: KeyDef) {}

    /*
    *enumerate1(): Generator<PitchClass, void, unknown> {
        let pc = this.def.accidental === 1 ? 3 : 6;
        const step = this.def.accidental === 1 ? 4 : 3;
        for(let i = 0; i < this.def.count; i++) {
            yield new PitchClass(pc, this.def.accidental);
            pc += step;
            pc %= 7;
        }        
    }*/

    enumerate(): PitchClass[] {
        return Key.enumerate(this.def.accidental, this.def.count);
    }

    static enumerate(accidental: Alteration, count: number): PitchClass[] {
        const firstPc = accidental === 1 ? 3 : 6; // pitchclass of resp. first # and first b
        // const firstPc = ifElse(equals(1), always(3), always(6))(accidental);
        const fifthStep = accidental * 4; // step a fifth up or down for each new accidental
        const toPCObject = (pc: number) => new PitchClass(pc, accidental); // pc number to PitchClass object

        const calcPc = pipe(multiply(fifthStep), add(firstPc), mathMod(__, 7), toPCObject); // pitchclass for nth accidental

        return times(calcPc, count); // all pitchclasses of key
    }

    static fromMode(pitch: PitchClass, mode: string): Key {
        let no = pitch.circleOf5Number;
        
        switch (mode) {
            case 'major': break;
            case 'minor': no -= 3; break;
        }

        return new Key({accidental: Math.sign(no) as (0 | 1 | -1), count: Math.abs(no)});
    }

    equals(key: Key): boolean {        
        return this.def.accidental === key.def.accidental && this.def.count === key.def.count;
    }
}

export class AccidentalManager {
    private _key: Key | undefined;
    private rememberPitches: { [key: number]: { value: Accidental, alteration: Accidental } } = {};
    private rememberPitchClasses: { [key: number]: { value: Accidental } } = {};

    newBar(): void {
        this.rememberPitches = {};
        this.rememberPitchClasses = {};
    }
    getAccidental(pitch: Pitch): Accidental {
        let res: Accidental = pitch.alteration;

        const alreadyThere = this.rememberPitches[pitch.diatonicNumber];

        if (alreadyThere !== undefined) {
            if (alreadyThere.alteration === (res ? res : 0)) {
                return undefined;
            } else {
                if (!res) res = 0;
            }
        } else {

            const pitchClassAlreadyThere = this.rememberPitchClasses[pitch.pitchClassNumber];
            //console.log(pitchClassAlreadyThere, this.rememberPitchClasses, pitch.pitchClass);
            
            let final = false;
            if (pitchClassAlreadyThere !== undefined) {
                //if (!res) res = 0;
                if (pitchClassAlreadyThere.value === res) {
                    // use key value
                    final = false;
                } else {
                    res = pitch.alteration;
                    final = true;
                }
            } 
            if (!final) {
                if (this._key) { 
                    const fixed = Array.from<PitchClass>(this._key.enumerate());
                    //console.log(fixed, pitch.pitchClass);
                    
                    const keyAcc = fixed.find((fix: PitchClass) => fix.pitchClass === pitch.pitchClassNumber);
                    if (keyAcc) {
                        if (res === keyAcc.alteration) return undefined;
                    } else if (res === 0) res = undefined;
                }
                else if (res === 0) res = undefined;
            }
        }

        this.rememberPitches[pitch.diatonicNumber] = { value: res, alteration: pitch.alteration };
        this.rememberPitchClasses[pitch.pitchClassNumber] = { value: pitch.alteration };
        return res;
    }
    setKey(key: Key): void {
        this._key = key;
        this.rememberPitches = {};
        this.rememberPitchClasses = {};
    }

}

export function displaceAccidentals(positions: number[]): number[] {
    const lastPositions: number[] = [];
    const revRes: number[] = [];

    positions.reverse().forEach(pos => {
        let dis = -0;
        while (lastPositions[dis] !== undefined && pos + 6 > lastPositions[dis]) {
            dis++;
        }
        if (!lastPositions[dis]) {
            lastPositions.push(pos);
        } else {
            lastPositions[dis] = pos;
        }
        
        revRes.push(-dis);
    });
    const res = revRes.reverse();
    if (res.length > 2 && res[0] === -2 && res[1] === -1)
    {
        return [res[1], res[0], ...res.slice(2)];
    }
    return res;
}

export function keyToLilypond(key: Key): string {
    const tonic = PitchClass.fromCircleOf5(key.def.accidental * key.def.count);
    const mode = '\\major';
    return `\\key ${tonic.pitchClassName} ${mode}`;
}