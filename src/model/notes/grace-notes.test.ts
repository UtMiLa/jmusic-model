import { Note } from './note';
import { TupletSequence } from './../score/transformations';
import { Time } from './../rationals/time';
import { getAllBeats, MeterFactory, MeterMap } from './../states/meter';
import { SimpleSequence } from './../score/sequence';
import { expect } from 'chai';
import { calcBeamGroups, __beaming_internal as __internal } from './beaming';
import { setGraceNoteInSequence } from '../../tools/test-tools';

describe('Grace notes', () => {

    it('should allow grace notes without influencing timing', () => {
        let seq = new SimpleSequence( 'c16 c2 c16 c16');
        seq = setGraceNoteInSequence(seq, 0);
        seq = setGraceNoteInSequence(seq, 2);
        seq = setGraceNoteInSequence(seq, 3);

        expect(seq.duration).to.deep.eq(Time.HalfTime);
    });

    
    it('should allocate grace notes to separate time slots', () => {
        let seq = new SimpleSequence( 'c16 c2 c16 c16');
        seq = setGraceNoteInSequence(seq, 0);
        seq = setGraceNoteInSequence(seq, 2);
        seq = setGraceNoteInSequence(seq, 3);

        const timeSlots = seq.getTimeSlots();
        expect(timeSlots).to.have.length(4);
    });
    
    it('should group grace notes to separate time slots', () => {
        let seq = new SimpleSequence( 'c16 c2 c16 c16');
        seq = setGraceNoteInSequence(seq, 0);
        seq = setGraceNoteInSequence(seq, 2);
        seq = setGraceNoteInSequence(seq, 3);

        const timeSlots = seq.groupByTimeSlots('m');
        expect(timeSlots).to.have.length(4);
    });


    // todo: distinguish between 'before' and 'after' grace notes
    // todo: distinguish between dashed and undashed grace notes
});