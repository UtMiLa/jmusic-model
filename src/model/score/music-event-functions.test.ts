import { FlexibleSequence } from './flexible-sequence';
import { ISequence } from './sequence';
import { expect } from 'chai';
import { Note, createNoteFromLilypond } from '../notes/note';
import { MeterFactory } from '../states/meter';
import { MatchEventStruct, empty, identity, matchEvent, transposeNote } from './music-event-functions';
import { Key } from '../states/key';
import { Interval } from '../pitches/intervals';

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


});