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


    
    it('should make correct beaming', () => {
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 2 },
            initialKey: { accidental: -1, count: 3 },
            initialMeter: { count: 4, value: 4, upBeat: Time.newSpan(1, 8) },
            voices:[{ content: {elements: 'bes8 r4 bes8 b8 b8. b16 bes8'} }]
        };

        const staffView = staffModelToViewModel(staff);

        expect(staffView.timeSlots.length).to.eq(7);
        expect(staffView.timeSlots[0].beamings, 'note 1').to.be.undefined;
        expect(staffView.timeSlots[2].beamings, 'note 2').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.newAbsolute(3, 8), 
                    uniq: '0-0-2'
                },
                {
                    absTime: Time.newAbsolute(1, 2),
                    uniq: '0-0-3'
                },
            ],
            beams: [{ fromIdx: 0, toIndex: 1, level: 0 }]
        }]);
        expect(staffView.timeSlots[3].beamings, 'note 3').to.be.undefined;        
        expect(staffView.timeSlots[4].beamings, 'note 4').to.deep.eq([{
            noteRefs: [
                {
                    absTime: Time.newAbsolute(5, 8), 
                    uniq: '0-0-4'
                },
                {
                    absTime: Time.newAbsolute(13, 16),
                    uniq: '0-0-5'
                },
            ],
            beams: [{ fromIdx: 0, toIndex: 1, level: 0 }, { fromIdx: undefined, toIndex: 1, level: 1 }]
        }]);
        expect(staffView.timeSlots[5].beamings, 'note 5').to.be.undefined;
        expect(staffView.timeSlots[6].beamings, 'note 6').to.be.undefined;
    });


});