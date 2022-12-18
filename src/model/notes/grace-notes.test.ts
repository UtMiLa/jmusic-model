import { Note } from './note';
import { TupletSequence } from './../score/transformations';
import { Time } from './../rationals/time';
import { getAllBeats, MeterFactory, MeterMap } from './../states/meter';
import { SimpleSequence } from './../score/sequence';
import { expect } from 'chai';
import { calcBeamGroups, __beaming_internal as __internal } from './beaming';

describe('Grace notes', () => {

    it('should allow grace notes without influencing timing', () => {
        const seq = new SimpleSequence( 'c16 c2 c16 c16');
        (seq.elements[0] as Note).grace = true;
        (seq.elements[2] as Note).grace = true;
        (seq.elements[3] as Note).grace = true;

        expect(seq.duration).to.deep.eq(Time.HalfTime);
    });

    
    it('should allocate grace notes to separate time slots', () => {
        const seq = new SimpleSequence( 'c16 c2 c16 c16');
        (seq.elements[0] as Note).grace = true;
        (seq.elements[2] as Note).grace = true;
        (seq.elements[3] as Note).grace = true;

        const timeSlots = seq.getTimeSlots();
        expect(timeSlots).to.have.length(4);
    });

    // todo: distinguish between 'before' and 'after' grace notes
    // todo: distinguish between dashed and undashed grace notes
});