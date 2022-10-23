import { RetrogradeSequence, TupletSequence } from './../../model/score/transformations';
import { SimpleSequence, CompositeSequence } from './../../model/score/sequence';
import { expect } from 'chai';
import { Time } from './../../model';
import { ClefType, StaffDef } from './../../model';
import { Clef } from './../../model';
import { createScopedTimeMap, __internal } from './convert-model';
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
            initialMeter: { count: 4, value: 4, upBeat: Time.EightsTime },
            voices:[{ content: new SimpleSequence( 'bes8 r4 bes8 b8 b8. b16 bes8') }]
        };

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect(staffView.timeSlots.length).to.eq(7);
        expect(staffView.timeSlots[0].accidentals).to.be.undefined;
        expect(staffView.timeSlots[2].accidentals).to.be.undefined;
        expect(staffView.timeSlots[3].accidentals).to.deep.eq([{ alteration: 0, displacement: 0, position: -3}]);
        expect(staffView.timeSlots[4].accidentals).to.be.undefined;
        expect(staffView.timeSlots[5].accidentals).to.be.undefined;
        expect(staffView.timeSlots[6].accidentals).to.deep.eq([{ alteration: -1, displacement: 0, position: -3}]);
    });


    
    it('should make correct beaming', () => {
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 2 },
            initialKey: { accidental: -1, count: 3 },
            initialMeter: { count: 4, value: 4, upBeat: Time.EightsTime },
            voices:[{ content: new SimpleSequence( 'bes8 r4 bes8 b8 b8. b16 bes8') }]
        };

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

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

    it('should make correct broken beams', () => {
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 2 },
            initialKey: { accidental: -1, count: 3 },
            initialMeter: { count: 4, value: 4 },
            voices:[{ content: new SimpleSequence( 'bes16 bes8 b16') }]
        };

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect(staffView.timeSlots.length).to.eq(3);
        expect(staffView.timeSlots[0].beamings, 'note 1').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.StartTime, 
                    uniq: '0-0-0'
                },
                {
                    absTime: Time.newAbsolute(1, 16),
                    uniq: '0-0-1'
                },
                {
                    absTime: Time.newAbsolute(3, 16),
                    uniq: '0-0-2'
                },
            ],
            beams: [
                { fromIdx: 0, toIndex: 2, level: 0 },
                { fromIdx: 0, toIndex: undefined, level: 1 },
                { fromIdx: undefined, toIndex: 2, level: 1 },
            ]
        }]);

    });


    it('should make correct beams in cloned notes', () => {

        const baseSequence = new SimpleSequence( 'bes8 b8 c8');
        const retrogradeSequence = new RetrogradeSequence(baseSequence);
        const combinedSequence = new CompositeSequence(baseSequence, retrogradeSequence);

        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 2 },
            initialKey: { accidental: -1, count: 3 },
            initialMeter: { count: 4, value: 4 },
            voices:[{ content: combinedSequence }]
        };

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect(staffView.timeSlots.length).to.eq(6);
        expect(staffView.timeSlots[0].beamings, 'note 1').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.StartTime, 
                    uniq: '0-0-0'
                },
                {
                    absTime: Time.newAbsolute(1, 8),
                    uniq: '0-0-1'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 1, level: 0 },
            ]
        }]);

        expect(staffView.timeSlots[2].beamings, 'note 3').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.newAbsolute(1, 4),
                    uniq: '0-0-2'
                },
                {
                    absTime: Time.newAbsolute(3, 8),
                    uniq: '0-0-3'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 1, level: 0 },
            ]
        }]);

        expect(staffView.timeSlots[4].beamings, 'note 5').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.newAbsolute(1, 2),
                    uniq: '0-0-4'
                },
                {
                    absTime: Time.newAbsolute(5, 8),
                    uniq: '0-0-5'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 1, level: 0 },
            ]
        }]);

    });

    it('should make correct beams in cloned tuplet notes', () => {

        const baseSequence = new SimpleSequence('bes8 b8 c8 d8 e8 f8');
        const tupletSequence = new TupletSequence(baseSequence, { numerator: 2, denominator: 3 });
        

        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 2 },
            initialKey: { accidental: -1, count: 3 },
            initialMeter: { count: 4, value: 4 },
            voices:[{ content: tupletSequence }]
        };

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect(staffView.timeSlots.length).to.eq(6);
        expect(staffView.timeSlots[0].beamings, 'note 1').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.StartTime, 
                    uniq: '0-0-0'
                },
                {
                    absTime: Time.newAbsolute(1, 12),
                    uniq: '0-0-1'
                },
                {
                    absTime: Time.newAbsolute(1, 6),
                    uniq: '0-0-2'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 2, level: 0 },
            ]
        }]);

        expect(staffView.timeSlots[3].beamings, 'note 3').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.newAbsolute(1, 4),
                    uniq: '0-0-3'
                },
                {
                    absTime: Time.newAbsolute(1, 3),
                    uniq: '0-0-4'
                },
                {
                    absTime: Time.newAbsolute(5, 12),
                    uniq: '0-0-5'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 2, level: 0 },
            ]
        }]);

    });

});