import { Alternation } from './../../model/pitches/pitch';
import { Pitch } from '../../model';
import { Clef } from './../../model/states/clef';
import { Key } from './../../model/states/key';


export interface KeyViewModelElement {
    position: number;
    alternation: Alternation;
}

export interface KeyViewModel {
    keyPositions: KeyViewModelElement[];
}

const clefMagicNo = {
    'b': [8, 6, 7, 8, 9, 10, 7],
    'x': [7, 6, 7, 6, 6, 6, 7]
};

export function keyToView(key: Key, clef: Clef): KeyViewModel {
    const clefC = clef.map(Pitch.fromScientific('c', 4));
    return {
        keyPositions: Array.from(key.enumerate()).map((item, i) => { 
            const p = item.circleOf5Number;

            let clefOffset = 4 - clefC;

            clefOffset = (clefOffset + 84) % 7;
            if (p < 0) {
                // b
                const magicNo = clefMagicNo['b'][clefOffset];
                const staffLine = ((i * 4 + clefOffset + 8 - magicNo) % 7) + magicNo - 6;
                return { position: 5 - staffLine, alternation: -1 };
            }
            else {
                // x
                const magicNo = clefMagicNo['x'][clefOffset];
                const staffLine = ((i * 3 + clefOffset + 11 - magicNo) % 7) + magicNo - 6;
                return { position: 5 - staffLine, alternation: 1 };
            }            
        })
    };
}
