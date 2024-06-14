import { ClefType } from './../data-only/states';
import { MeterFactory } from './../states/meter';
import { Time } from './../rationals/time';
import { Clef } from './../states/clef';
import { expect } from 'chai';
import { createNote } from '../notes/note';
import { Pitch } from '../pitches/pitch';
import { DiatonicKey, Key } from '../states/key';
import R = require('ramda');
import { makeClef } from './clef-flex';
import { makeKey } from './key-flex';
import { makeMeter } from './meter-flex';
import { makeNote } from './note-flex';

describe('Facade', () => {


    describe('Flex methods', () => {
        it('should read a meter in different types', () => {
            expect(makeMeter('5/8')).to.deep.eq({ count: 5, value: 8 });
            expect(makeMeter({ count: 5, value: 8 })).to.deep.eq({ count: 5, value: 8 });
            expect(makeMeter(MeterFactory.createRegularMeter({ count: 5, value: 8 }))).to.deep.eq({ count: 5, value: 8 });
        });

        it('should read a clef in different types', () => {
            expect(makeClef('treble')).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(makeClef({ clefType: ClefType.G, line: -2 })).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(makeClef(Clef.create({ clefType: ClefType.G, line: -2 }))).to.deep.eq({ clefType: ClefType.G, line: -2 });
        });

        it('should read a key in different types', () => {
            expect(makeKey('a \\major')).to.deep.eq({ accidental: 1, count: 3 });
            expect(makeKey({ accidental: 1, count: 3 })).to.deep.eq({ accidental: 1, count: 3 });
            expect(makeKey(new DiatonicKey({ accidental: 1, count: 3 }))).to.deep.eq({ accidental: 1, count: 3 });
        });

        it('should read a note in different types', () => {
            expect(makeNote('a,4')).to.deep.eq(createNote([Pitch.fromScientific('a', 2)], Time.QuarterTime));
            expect(makeNote(createNote([Pitch.fromScientific('a', 2)], Time.QuarterTime))).to.deep.eq(createNote([Pitch.fromScientific('a', 2)], Time.QuarterTime));
        });
    });

});