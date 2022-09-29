import { expect } from 'chai';
import { Time } from './../../model';
import { ClefType, StaffDef } from './../../model';
import { Sequence } from './../../model';
import { Clef } from './../../model';
import { staffModelToViewModel } from './convert-model';
/* eslint-disable comma-dangle */

describe('View model', () => {

    let clef: Clef;

    beforeEach(() => { 
        clef = Clef.clefTreble;
    });

    it('should remember accidentals within the same measure', () => {
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 2 },
            initialKey: { accidental: -1, count: 3 },
            initialMeter: { count: 4, value: 4, upBeat: Time.newSpan(1, 8) },
            voices:[{ content: {elements: 'bes8 r4 bes8 b8 b8. b16 bes8'} }]
        };

        const staffView = staffModelToViewModel(staff);

        expect(staffView.timeSlots.length).to.eq(7);
        expect(staffView.timeSlots[0].accidentals).to.be.undefined;
        expect(staffView.timeSlots[2].accidentals).to.be.undefined;
        expect(staffView.timeSlots[3].accidentals).to.deep.eq([{ alternation: 0, displacement: 0, position: -3}]);
        expect(staffView.timeSlots[4].accidentals).to.be.undefined;
        expect(staffView.timeSlots[5].accidentals).to.be.undefined;
        expect(staffView.timeSlots[6].accidentals).to.deep.eq([{ alternation: -1, displacement: 0, position: -3}]);
    });


});