import { Pitch } from '~/model';
import { Clef } from './../../model/states/clef';
import { Key } from './../../model/states/key';

export interface KeyViewModel {
    positions: number[];
}

const clefMagicNo = {
    'b': [8, 6, 7, 8, 9, 10, 7],
    'x': [7, 6, 7, 6, 6, 6, 7]
};

export function keyToView(key: Key, clef: Clef): KeyViewModel {
    const clefC = clef.map(Pitch.fromScientific('c', 4));
    return {
        positions: Array.from(key.enumerate()).map((item, i) => { 
            const p = item.circleOf5Number;
            //console.log('pitch', item, p);
            

            let clefOffset = 4 - clefC;
            /*
            clefC = -this.def.clefType + this.def.line + 0;

            g: 2 + 2*4 = 10                    -4 -2 = -6
            alt: -2 + 2*3 = 4                   0  +0 = 0
            tenor-c: -2 + 2*2 = 2               0  +2 = 2
            tenor-g: 2 + -7 + 2*4 = 3           3 -2 = 1
            bas: -6 + 2*2 = -2                  4  +2 = 6



                clefLine måles fra toppen
            
            public clefDef(): number {
                switch (this.clefCode) {
                    case ClefType.ClefG: return 2;
                    case ClefType.ClefC: return -2;
                    case ClefType.ClefF: return -6;
                    case ClefType.ClefNone: return -2;
                    case ClefType.ClefPercussion: return -2;
                    case ClefType.ClefTab: return -2;
                }
            }
            */
            clefOffset = (clefOffset + 84) % 7;
            if (p < 0) {
                // b
                const magicNo = clefMagicNo['b'][clefOffset];
                const staffLine = ((i * 4 + clefOffset + 8 - magicNo) % 7) + magicNo - 6;
                return 5 - staffLine;
            }
            else {
                // x
                const magicNo = clefMagicNo['x'][clefOffset];
                const staffLine = ((i * 3 + clefOffset + 11 - magicNo) % 7) + magicNo - 6;
                return 5 - staffLine;
            }            
        })
    };
}
