import { Key } from './../../model/states/key';
import { Clef } from './../../model/states/clef';
import { expect } from 'chai';
import { keyToView } from './convert-key';

describe('View model: Keys', () => {

    let keyAs: Key, keyCes: Key, keyCis: Key;
    const clefG = Clef.clefTreble;

    beforeEach(() => { 
        keyAs = new Key({  accidental: -1, count: 4 });
        keyCes = new Key({  accidental: -1, count: 7 });
        keyCis = new Key({  accidental: 1, count: 7 });
    });

    it('should convert a key to view model', () => {
        const keySig = keyToView(keyAs, clefG);
        expect(keySig.keyPositions).to.deep.equal([0, 3, -1, 2].map(p => ({ position: p, alteration: -1 })));
    });

    const keydefs = { // key signatures in different clefs
        'b': {
            3: [5, 2, 6, 3, 7, 4, 8], // g - measured from the first space
            5: [7, 4, 8, 5, 9, 6, 10], // f           above the staff
            0: [2, 6, 3, 7, 4, 8, 5], // c1           (like g'' in g clef
            2: [4, 1, 5, 2, 6, 3, 7], // c2            and b in f clef)
            4: [6, 3, 7, 4, 8, 5, 9], // c3
            6: [1, 5, 2, 6, 3, 7, 4], // c4
            1: [3, 0, 4, 1, 5, 2, 6] // c4
        },
        'x': {
            3: [1, 4, 0, 3, 6, 2, 5],
            5: [3, 6, 2, 5, 1, 4, 0],
            0: [5, 1, 4, 7, 3, 6, 2],
            2: [7, 3, 6, 2, 5, 1, 4],
            4: [2, 5, 1, 4, 0, 3, 6],
            6: [4, 7, 3, 6, 2, 5, 1],
            1: [6, 2, 5, 1, 4, 0, 3]
        }
    };

    it('should place all flat keys according to clef', () => {
        const keySig1 = keyToView(keyCes, clefG);
        const result1 = keydefs['b'][3].map(p => ({ position: 5 - p, alteration: -1 }));
        expect(keySig1.keyPositions).to.deep.equal(result1);

        const keySig2 = keyToView(keyCes, Clef.clefAlto);
        const result2 = keydefs['b'][4].map(p => ({ position: 5 - p, alteration: -1 }));
        expect(keySig2.keyPositions).to.deep.equal(result2);

        const keySig3 = keyToView(keyCes, Clef.clefBass);
        const result3 = keydefs['b'][5].map(p => ({ position: 5 - p, alteration: -1 }));
        expect(keySig3.keyPositions).to.deep.equal(result3);

    });

    it('should place all sharp keys according to clef', () => {
        const keySig1 = keyToView(keyCis, clefG);
        const result1 = keydefs['x'][3].map(p => ({ position: 5 - p, alteration: 1 }));
        expect(keySig1.keyPositions).to.deep.equal(result1);

        const keySig2 = keyToView(keyCis, Clef.clefAlto);
        const result2 = keydefs['x'][4].map(p => ({ position: 5 - p, alteration: 1 }));
        expect(keySig2.keyPositions).to.deep.equal(result2);

        const keySig3 = keyToView(keyCis, Clef.clefBass);
        const result3 = keydefs['x'][5].map(p => ({ position: 5 - p, alteration: 1 }));
        expect(keySig3.keyPositions).to.deep.equal(result3);

    });

});

