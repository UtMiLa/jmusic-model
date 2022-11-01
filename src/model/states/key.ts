import { Alteration, Pitch, PitchClass, Accidental } from './../pitches/pitch';

export interface KeyDef {
    accidental: Alteration;
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

    static fromMode(pitch: PitchClass, mode: string): Key {
        let no = pitch.circleOf5Number;
        //console.log('fromMode', no, pitch, mode);
        
        switch (mode) {
            case 'major': break;
            case 'minor': no -= 3; break;
        }
        //console.log('fromMode', no);

        return new Key({accidental: Math.sign(no) as (0 | 1 | -1), count: Math.abs(no)});
    }

    equals(key: Key): boolean {        
        return this.def.accidental === key.def.accidental && this.def.count === key.def.count;
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
        let res: Accidental = pitch.alteration;

        const alreadyThere = this.rememberPitches[pitch.diatonicNumber];

        if (alreadyThere !== undefined) {
            if (alreadyThere === res) {
                return undefined;
            } else {
                if (!res) res = 0;
            }
        } else {

            const pitchClassAlreadyThere = this.rememberPitchClasses[pitch.pitchClassNumber];
            //console.log(pitchClassAlreadyThere, this.rememberPitchClasses, pitch.pitchClass);
            
            if (pitchClassAlreadyThere !== undefined) {
                if (!res) res = 0;
            } else if (this._key) { 
                const fixed = Array.from<PitchClass>(this._key.enumerate());
                //console.log(fixed, pitch.pitchClass);
                
                const keyAcc = fixed.find((fix: PitchClass) => fix.pitchClass === pitch.pitchClassNumber);
                if (keyAcc) {
                    if (res === keyAcc.alteration) return undefined;
                } else if (res === 0) res = undefined;
            }
            else if (res === 0) res = undefined;            
        }

        this.rememberPitches[pitch.diatonicNumber] = res;
        this.rememberPitchClasses[pitch.pitchClassNumber] = res;
        return res;
    }
    setKey(key: Key): void {
        this._key = key;
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