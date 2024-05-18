import { Time } from './../rationals/time';
import { Spacer } from './../notes/spacer';
import { FlexibleSequence } from './flexible-sequence';
import { ISequence, parseLilyElement } from './sequence';
import { expect } from 'chai';
import { Note, createNoteFromLilypond } from '../notes/note';
import { MeterFactory } from '../states/meter';
import { MatchEventStruct, augment, empty, identity, matchEvent, transposeKey, transposeNote } from './music-event-functions';
import { Key } from '../states/key';
import { Interval } from '../pitches/intervals';
import { Rational } from '../rationals/rational';
import { LongDecorationElement, LongDecorationType } from '../data-only/decorations';

describe('MusicEvent functions', () => {

    let sequence: ISequence;

    beforeEach(() => {
        sequence = new FlexibleSequence(['c\'4.', 'd\'8', 'b8', 
            { isState: true, meter: MeterFactory.createRegularMeter({ count: 3, value: 4 })}, 
            { isState: true, key: new Key({ accidental: -1, count: 1 })},
            'c\'2.', 's1']); // ought to accept { meter: { count: 3, value: 4} } and '\\time 3/4'
    });

    it('should leave events unchanged when using identity function', () => {        
        expect(identity(sequence.elements[0])).to.deep.eq([createNoteFromLilypond('c\'4.')]);
        expect(identity(sequence.elements[3])).to.deep.eq([{ isState: true, meter: MeterFactory.createRegularMeter({ count: 3, value: 4 })}]);
        expect(identity(sequence.elements[4])).to.deep.eq([{ isState: true, key: new Key({ accidental: -1, count: 1 })}]);
    });

    it('should remove events unchanged when using empty function', () => {        
        expect(empty(sequence.elements[0])).to.deep.eq([]);
        expect(empty(sequence.elements[3])).to.deep.eq([]);
        expect(empty(sequence.elements[4])).to.deep.eq([]);
    });


    it('should pattern match events based on type', () => {        
        const pattern: MatchEventStruct = {
            note: identity,
            spacer: empty,
            state: () => [createNoteFromLilypond('f,,2')],
            longDeco: empty
        };
        expect(matchEvent(pattern)(sequence.elements[0])).to.deep.eq([createNoteFromLilypond('c\'4.')]);
        expect(matchEvent(pattern)(sequence.elements[3])).to.deep.eq([createNoteFromLilypond('f,,2')]);
        expect(matchEvent(pattern)(sequence.elements[4])).to.deep.eq([createNoteFromLilypond('f,,2')]);
        expect(matchEvent(pattern)(sequence.elements[6])).to.deep.eq([]);
    });


    
    it('should transpose notes', () => {        
        const interval: Interval = {
            interval: 2,
            alteration: -1
        };
        expect(transposeNote(interval)(sequence.elements[0] as Note)).to.deep.eq([createNoteFromLilypond('ees\'4.')]);
        expect(transposeNote(interval)(sequence.elements[1] as Note)).to.deep.eq([createNoteFromLilypond('f\'8')]);
        expect(transposeNote(interval)(sequence.elements[2] as Note)).to.deep.eq([createNoteFromLilypond('d\'8')]);
    });

    it('should transpose key signature', () => {
        const interval: Interval = {
            interval: 2,
            alteration: -1
        };
        expect(transposeKey(interval)({ isState: true, key: new Key({ accidental: -1, count: 1 })})).to.deep.eq([{ isState: true, key: new Key({ accidental: -1, count: 4 })}]);
        expect(transposeKey(interval)({ isState: true, key: new Key({ accidental: 1, count: 1 })})).to.deep.eq([{ isState: true, key: new Key({ accidental: -1, count: 2 })}]);
        expect(transposeKey(interval)({ isState: true, key: new Key({ accidental: 0, count: 0 })})).to.deep.eq([{ isState: true, key: new Key({ accidental: -1, count: 3 })}]);
        expect(transposeKey(interval)({ isState: true, key: new Key({ accidental: 1, count: 3 })})).to.deep.eq([{ isState: true, key: new Key({ accidental: 0, count: 0 })}]);
    });

    
    it('should transpose by pattern', () => {
        const interval: Interval = {
            interval: 2,
            alteration: -1
        };
        const pattern: MatchEventStruct = {
            note: transposeNote(interval),
            spacer: identity,
            state: transposeKey(interval),
            longDeco: identity
        };
        const f = matchEvent(pattern);
        expect(f(sequence.elements[0])).to.deep.eq([createNoteFromLilypond('ees\'4.')]);
        expect(f(sequence.elements[1])).to.deep.eq([createNoteFromLilypond('f\'8')]);
        expect(f(sequence.elements[2])).to.deep.eq([createNoteFromLilypond('d\'8')]);
        expect(f(sequence.elements[3])).to.deep.eq([{ isState: true, meter: MeterFactory.createRegularMeter({ count: 3, value: 4 })}]);
        expect(f(sequence.elements[4])).to.deep.eq([ { isState: true, key: new Key({ accidental: -1, count: 4 })}]);
        expect(matchEvent(pattern)(sequence.elements[6])).to.deep.eq([parseLilyElement('s1')]);

    });

    it('should augment notes', () => {
        expect(augment({ numerator: 2, denominator: 1 })(sequence.elements[0])).to.deep.eq([createNoteFromLilypond('c\'2.')]);
        expect(augment({ numerator: 2, denominator: 1 })(sequence.elements[1])).to.deep.eq([createNoteFromLilypond('d\'4')]);
        expect(augment({ numerator: 2, denominator: 1 })(sequence.elements[2])).to.deep.eq([createNoteFromLilypond('b4')]);
        expect(augment({ numerator: 2, denominator: 1 })(sequence.elements[3])).to.deep.eq([sequence.elements[3]]);
        expect(augment({ numerator: 2, denominator: 1 })(sequence.elements[4])).to.deep.eq([sequence.elements[4]]);
        expect(augment({ numerator: 2, denominator: 1 })(sequence.elements[6])).to.deep.eq([parseLilyElement('s1*2/1')]);

        sequence.insertElements(Time.newAbsolute(3, 8), [{ longDeco: LongDecorationType.Slur, length: Time.HalfTime }]);
        expect(augment({ numerator: 2, denominator: 1 })(sequence.elements[1])).to.deep.eq([{ longDeco: LongDecorationType.Slur, length: Time.WholeTime }]);
    });

    
    it('should diminish notes', () => {
        expect(augment({ numerator: 1, denominator: 2 })(sequence.elements[0])).to.deep.eq([createNoteFromLilypond('c\'8.')]);
        expect(augment({ numerator: 1, denominator: 2 })(sequence.elements[1])).to.deep.eq([createNoteFromLilypond('d\'16')]);
        expect(augment({ numerator: 1, denominator: 2 })(sequence.elements[2])).to.deep.eq([createNoteFromLilypond('b16')]);
        expect(augment({ numerator: 1, denominator: 2 })(sequence.elements[3])).to.deep.eq([sequence.elements[3]]);
        expect(augment({ numerator: 1, denominator: 2 })(sequence.elements[4])).to.deep.eq([sequence.elements[4]]);
        expect(augment({ numerator: 1, denominator: 2 })(sequence.elements[6])).to.deep.eq([parseLilyElement('s2')]);

        sequence.insertElements(Time.newAbsolute(3, 8), [{ longDeco: LongDecorationType.Slur, length: Time.HalfTime }]);
        expect(augment({ numerator: 1, denominator: 2 })(sequence.elements[1])).to.deep.eq([{ longDeco: LongDecorationType.Slur, length: Time.QuarterTime }]);
    });

});