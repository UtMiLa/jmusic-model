import { Key } from './../../model/states/key';
import { Clef } from './../../model/states/clef';
import { Note } from './../../model/notes/note';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { ClefType } from '~/model/states/clef';
import { expect } from 'chai';
import { noteToView, FlagType } from './note-view-model';
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
        expect(keySig.positions).to.deep.equal([0, 3, -1, 2]);
    });

    const keydefs = {
        'b': {
            3: [5, 2, 6, 3, 7, 4, 8], // g
            5: [7, 4, 8, 5, 9, 6, 10], // f
            0: [2, 6, 3, 7, 4, 8, 5], // c1
            2: [4, 1, 5, 2, 6, 3, 7], // c2
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
        const result1 = keydefs['b'][3].map(n => 5 - n);
        expect(keySig1.positions).to.deep.equal(result1);

        const keySig2 = keyToView(keyCes, Clef.clefAlto);
        const result2 = keydefs['b'][4].map(n => 5 - n);
        expect(keySig2.positions).to.deep.equal(result2);

        const keySig3 = keyToView(keyCes, Clef.clefBass);
        const result3 = keydefs['b'][5].map(n => 5 - n);
        expect(keySig3.positions).to.deep.equal(result3);

    });

    it('should place all sharp keys according to clef', () => {
        const keySig1 = keyToView(keyCis, clefG);
        const result1 = keydefs['x'][3].map(n => 5 - n);
        expect(keySig1.positions).to.deep.equal(result1);

        const keySig2 = keyToView(keyCis, Clef.clefAlto);
        const result2 = keydefs['x'][4].map(n => 5 - n);
        expect(keySig2.positions).to.deep.equal(result2);

        const keySig3 = keyToView(keyCis, Clef.clefBass);
        const result3 = keydefs['x'][5].map(n => 5 - n);
        expect(keySig3.positions).to.deep.equal(result3);

    });


});

