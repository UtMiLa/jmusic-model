import { InsertionPoint } from './../../editor/insertion-point';
import { BarType } from './score-view-model';
import { FlagType } from './note-view-model';
import { RetrogradeSequence, TupletSequence } from './../../model/score/transformations';
import { SimpleSequence, CompositeSequence } from './../../model/score/sequence';
import { expect } from 'chai';
import { JMusic, LongDecorationType, NoteDirection, NoteType, Time } from './../../model';
import { ClefType, StaffDef } from './../../model';
import { Clef } from './../../model';
import { scoreModelToViewModel, __internal } from './convert-model';
import { createTestStaff } from '../../tools/test-tools';
import { createScopedTimeMap } from './state-map';
/* eslint-disable comma-dangle */

describe('View model', () => {

    let clef: Clef;

    beforeEach(() => { 
        clef = Clef.clefTreble;
    });

    it('should remember accidentals within the same measure', () => {
        const staff: StaffDef = createTestStaff(['bes8 r4 bes8 b8 b8. b16 bes8'], [4, 4, 1, 8], [-1, 3]);

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect(staffView.timeSlots.length).to.eq(8);
        expect(staffView.timeSlots[0].accidentals).to.be.undefined;
        expect(staffView.timeSlots[3].accidentals).to.be.undefined;
        expect(staffView.timeSlots[4].accidentals).to.deep.eq([{ alteration: 0, displacement: 0, position: -7}]);
        expect(staffView.timeSlots[5].accidentals).to.be.undefined;
        expect(staffView.timeSlots[6].accidentals).to.be.undefined;
        expect(staffView.timeSlots[7].accidentals).to.deep.eq([{ alteration: -1, displacement: 0, position: -7}]);
    });


    
    it('should make correct beaming', () => {
        const staff: StaffDef = createTestStaff(['bes8 r4 bes8 b8 b8. b16 bes8'], [4, 4, 1, 8], [-1, 3]);

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect(staffView.timeSlots.length).to.eq(8);
        expect(staffView.timeSlots[0].beamings, 'note 1').to.be.undefined;
        expect(staffView.timeSlots[3].beamings, 'note 2').to.deep.eq([{
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
        expect(staffView.timeSlots[4].beamings, 'note 3').to.be.undefined;        
        expect(staffView.timeSlots[5].beamings, 'note 4').to.deep.eq([{
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
        expect(staffView.timeSlots[6].beamings, 'note 5').to.be.undefined;
        expect(staffView.timeSlots[7].beamings, 'note 6').to.be.undefined;
    });

    it('should make correct broken beams', () => {
        const staff: StaffDef = createTestStaff(['bes16 bes8 b16'], [4, 4], [-1, 3]);

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

    it('should make correct quintuplet brackets', () => {

        const baseSequence = new SimpleSequence('bes8 b8 c8 d8 e8');
        const tupletSequence = new TupletSequence(baseSequence, { numerator: 4, denominator: 5 });
        

        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 2 },
            initialKey: { accidental: -1, count: 3 },
            initialMeter: { count: 4, value: 4 },
            voices:[{ content: tupletSequence }]
        };

        const staffView = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect(staffView.timeSlots.length).to.eq(5);
        expect(staffView.timeSlots[0].tuplets, 'note 1').to.deep.eq([{
            noteRefs: [ 
                {
                    absTime: Time.StartTime, 
                    uniq: '0-0-0'
                },
                {
                    absTime: Time.newAbsolute(1, 10),
                    uniq: '0-0-1'
                },
                {
                    absTime: Time.newAbsolute(1, 5),
                    uniq: '0-0-2'
                },
                {
                    absTime: Time.newAbsolute(3, 10),
                    uniq: '0-0-3'
                },
                {
                    absTime: Time.newAbsolute(2, 5),
                    uniq: '0-0-4'
                }
            ],
            tuplets: [
                { fromIdx: 0, toIndex: 4, tuplet: '5' },
            ]
        }]);

    });

    
    xit('should make split sextuplets to triplets', () => {

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

        expect(staffView.timeSlots[0].tuplets, 'note 1').to.deep.eq([{
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
            tuplets: [
                { fromIdx: 0, toIndex: 2, tuplet: '3' },
            ]
        }]);

        expect(staffView.timeSlots[3].tuplets, 'note 3').to.deep.eq({
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
            tuplets: [
                { fromIdx: 0, toIndex: 2, tuplet: '3' },
            ]
        });

    });

    it('should convert a time-restricted subset', () => {
        const score = new JMusic({ content: [['c\'\'1 d\'\'1 e\'\'1'], ['c\'1 d\'1 e\'1']] });

        const log1 = scoreModelToViewModel(score);
        expect(log1.staves[0].timeSlots[0].notes[0]).to.deep.include({ positions: [1], uniq: '0-0-0' });

        const log2 = scoreModelToViewModel(score, { startTime: Time.newAbsolute(1, 1), endTime: Time.EternityTime });
        expect(log2.staves[0].timeSlots[0].notes[0]).to.deep.include({ positions: [2], uniq: '0-0-1' });
    });


    
    it('should set correct initial states for a time-restricted subset', () => {
        const score = new JMusic({ content: [['c\'\'1 \\key e \\major d\'\'1 e\'\'1'], ['c\'1 \\meter 2/2 d\'1 e\'1']], meter: '4/4' });

        const log1 = scoreModelToViewModel(score);
        expect(log1.staves[0].timeSlots[0].notes[0]).to.deep.include({ positions: [1], uniq: '0-0-0' });
        expect(log1.staves[0].timeSlots[0].clef).to.deep.eq({ clefType: ClefType.G, line: -2, position: 1});
        expect(log1.staves[0].timeSlots[0].meter).to.deep.eq({ meterText: ['4', '4'] });
        expect(log1.staves[0].timeSlots[0].key).to.deep.eq({ keyPositions: [] });

        const log2 = scoreModelToViewModel(score, { startTime: Time.newAbsolute(2, 1), endTime: Time.EternityTime });
        expect(log2.staves[0].timeSlots[0].notes[0]).to.deep.include({ positions: [3], uniq: '0-0-3' });
        expect(log2.staves[0].timeSlots[0].clef).to.deep.eq({ clefType: ClefType.G, line: -2, position: 1});
        expect(log2.staves[0].timeSlots[0].meter).to.be.undefined;
        expect(log2.staves[0].timeSlots[0].key).to.deep.eq({ keyPositions: [{ alteration: 1, position: 4}, { alteration: 1, position: 1}, { alteration: 1, position: 5}, { alteration: 1, position: 2}] });
    });
    
    it('should time-restrict endpoint', () => {
        const score = new JMusic({ content: [['c\'\'1 d\'\'1 ees\'\'1'], ['c\'1 d\'1 e\'1']], meter: '4/4' });

        const log2 = scoreModelToViewModel(score, { startTime: Time.newAbsolute(1, 1), endTime: Time.newAbsolute(2, 1) });
        expect(log2.staves[0].timeSlots[0].notes[0]).to.deep.include({ positions: [2], uniq: '0-0-1' });
        expect(log2.staves[0].timeSlots[2].notes).to.deep.eq([]);
        expect(log2.staves[0].timeSlots[2].accidentals).to.deep.eq([]);
        expect(log2.staves[0].timeSlots[1].bar).to.deep.eq({ barType: BarType.Simple });
    });

    it('should add repeats', () => {
        const score = new JMusic({ content: [['c\'\'1 d\'\'1 ees\'\'1']], meter: '4/4' });
        score.repeats = [{from: Time.newAbsolute(1,1), to: Time.newAbsolute(2,1)}];

        
        const log2 = scoreModelToViewModel(score);
        //console.log(log2.staves[0].timeSlots);
        expect(log2.staves[0].timeSlots[1].bar).to.deep.eq({ barType: BarType.Simple, repeatStart: true });
        expect(log2.staves[0].timeSlots[3].bar).to.deep.eq({ barType: BarType.Simple, repeatEnd: true });
    });

    describe('Expressions', () => {
        it('should convert a hairpin crescendo', () => {
            const score = new JMusic({ content: [['c\'\'1 d\'\'1 ees\'\'1'], ['c\'1 d\'1 e\'1']], meter: '4/4' });
            const ins1 = new InsertionPoint(score);
            ins1.staffNo = 0;
            ins1.voiceNo = 0;
            ins1.time = Time.StartTime;
            score.addLongDecoration(LongDecorationType.Crescendo, ins1, Time.newSpan(2, 1));
    
            const log2 = scoreModelToViewModel(score);
            expect(log2.staves[0].timeSlots[0].decorations).to.deep.eq([
                { 
                    type: LongDecorationType.Crescendo, 
                    noteRefs: [
                        { uniq: '0-0-1', absTime: Time.newAbsolute(0, 1) },
                        { uniq: '0-0-3', absTime: Time.newAbsolute(2, 1) }
                    ] // todo: maybe uniq should number the actual notes or the time slots instead of the elements (including decorations and state changes)
                }
            ]);
        });
    
    });

});