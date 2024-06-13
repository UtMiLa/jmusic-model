import { Alteration } from './../../model';
import { Pitch } from '../../model';
import { Clef } from './../../model';
import { Key } from './../../model';
import { mathMod } from 'ramda';


export interface KeyViewModelElement {
    position: number;
    alteration: Alteration;
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
        keyPositions: Array.from(key.enumerate()).map(item => { 
            const p = item.circleOf5Number;

            let clefOffset = 4 - clefC;

            clefOffset = mathMod(clefOffset, 7);
            if (p < 0) {
                // b
                const magicNo = clefMagicNo['b'][clefOffset];
                const staffLine = mathMod((-p * 4 + clefOffset - magicNo), 7) + magicNo - 6;
                return { position: 5 - staffLine, alteration: -1 };
            }
            else {
                // x
                const magicNo = clefMagicNo['x'][clefOffset];
                const staffLine = mathMod((p * 3 + clefOffset - magicNo), 7) + magicNo - 6;
                return { position: 5 - staffLine, alteration: 1 };
            }            
        })
    };
}
