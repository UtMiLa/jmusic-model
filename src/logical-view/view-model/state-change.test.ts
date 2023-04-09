import { EventType } from './../../model/score/timing-order';
import { getExtendedTime } from '../../model/score/timing-order';
import { createTestScore, createTestScoreVM } from '../../tools/test-tools';
import { SimpleSequence } from './../../model/score/sequence';
import { MeterFactory } from './../../model/states/meter';
import { ScoreDef } from './../../model/score/score';
import { Time } from './../../model/rationals/time';
import { Clef } from './../../model/states/clef';
import { Staff } from './../../model/score/staff';
import { StaffDef } from '../../model/score/staff';
import { expect } from 'chai';
import { ClefType } from '../../model/states/clef';
import { scoreModelToViewModel } from './convert-model';

describe('State change view model', () => {

    let staffClef: StaffDef;

    beforeEach(() => { 
        staffClef = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialKey: { accidental: -1, count: 4 },
            voices: []
        };
    });

    describe('clef changes', () => {
        it('should change positions after a clef change', () => {
            Staff.setSequence(staffClef, new SimpleSequence( 'c\'4 \\clef alto c\'4 \\clef bass c\'4'));
    
            const vm = scoreModelToViewModel({staves: [staffClef]}).staves[0];
    
            expect(vm.timeSlots.length).to.eq(6);
            expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [-6] });
            expect(vm.timeSlots[2].clef).to.deep.include({clefType: ClefType.C, line: 0});
            expect(vm.timeSlots[3].notes[0]).to.deep.include({ positions: [0] });
            expect(vm.timeSlots[5].notes[0]).to.deep.include({ positions: [6] });
        });
               
    
        it('should also change positions in another voice after a clef change', () => {
            Staff.setSequence(staffClef, new SimpleSequence( 'c\'4 \\clef alto c\'4 \\clef bass c\'4'));
            staffClef.voices.push({content: new SimpleSequence('b4 b4 b4')});
    
            const vm = scoreModelToViewModel({staves: [staffClef]}).staves[0];
    
            expect(vm.timeSlots.length).to.eq(6);
            expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [-6] });
            expect(vm.timeSlots[3].notes[0]).to.deep.include({ positions: [0] });
            expect(vm.timeSlots[5].notes[0]).to.deep.include({ positions: [6] });
    
            expect(vm.timeSlots[1].notes[1]).to.deep.include({ positions: [-7] });
            expect(vm.timeSlots[3].notes[1]).to.deep.include({ positions: [-1] });
            expect(vm.timeSlots[5].notes[1]).to.deep.include({ positions: [5] });
    
        });
    
    
        it('should change clef for all voices, even if they dont share the timeslot of the clef change', () => {
            const score = createTestScoreVM([[
                'c2 \\clef C c1.',
                'c1 c1'
            ]], [], [-1, 3], ['bass']);
    
            expect(score.staves[0].timeSlots).to.have.length(5);
    
            expect(score.staves[0].timeSlots[1].notes.map(ts => ts.positions)).to.deep.eq(
                [ [-1],[-1] ]
            );
            expect(score.staves[0].timeSlots[2].clef).to.deep.include({
                change: true,
                clefType: ClefType.C,
                line: 0
            });
    
            expect(score.staves[0].timeSlots[3].notes.map(ts => ts.positions)).to.deep.eq(
                [[-7]]
            );
    
            expect(score.staves[0].timeSlots[4].clef).to.be.undefined;

            expect(score.staves[0].timeSlots[4].notes.map(ts => ts.positions)).to.deep.eq(
                [[-7]]
            );
                
        });
    

        it('should also change positions in another voice after a clef change', () => {
            Staff.setSequence(staffClef, new SimpleSequence( 'c\'4 \\clef alto c\'4 \\clef bass c\'4'));
            staffClef.voices.push({content: new SimpleSequence('b4 b4 b4')});

            const vm = scoreModelToViewModel({staves: [staffClef]}).staves[0];

            expect(vm.timeSlots.length).to.eq(6);
            expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [-6] });
            expect(vm.timeSlots[3].notes[0]).to.deep.include({ positions: [0] });
            expect(vm.timeSlots[5].notes[0]).to.deep.include({ positions: [6] });

            expect(vm.timeSlots[1].notes[1]).to.deep.include({ positions: [-7] });
            expect(vm.timeSlots[3].notes[1]).to.deep.include({ positions: [-1] });
            expect(vm.timeSlots[5].notes[1]).to.deep.include({ positions: [5] });

        });    

        it('should allow different clef changes at different staves at same time', () => {
            const staff2 = {...staffClef};

            Staff.setSequence(staffClef, new SimpleSequence( 'c\'4 \\clef alto c\'4 \\clef bass c\'4'));
            staffClef.voices.push({content: new SimpleSequence('b4 b4 b4')});

            Staff.setSequence(staff2, new SimpleSequence( 'c\'4 \\clef bass c\'4 \\clef bass c\'4'));
            staff2.voices.push({content: new SimpleSequence('b4 b4 b4')});

            const scoreDef = {staves: [staffClef, staff2]};

            const vm = scoreModelToViewModel(scoreDef);

            expect(vm.staves[0].timeSlots).to.have.length(6);

        });
        


        it('should disallow different key changes at the same staff at same time', () => {
            /*const scoreModel: ScoreDef = {
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\clef treble c4 c4 c4 c4 c1')},
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\clef bass c4 c4 c4 c4 c1')}
                    ]
                }]
            };*/
            const scoreModel = createTestScore([[
                'c8 c4 c4 c4 \\clef treble c4 c4 c4 c4 c1',
                'c8 c4 c4 c4 \\clef bass c4 c4 c4 c4 c1'
            ]], [3, 4, 1, 8], [-1, 3], ['bass']);

            expect(() => scoreModelToViewModel(scoreModel)).to.throw('Two clef changes in the same staff');
    
        });

        it('should allow equal key changes at the same staff at same time', () => {
            /*const scoreModel1: ScoreDef = {
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\clef bass c4 c4 c4 c4 c1')},
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\clef bass c4 c4 c4 c4 c1')}
                    ]
                }]
            };*/

            const scoreModel = createTestScore([[
                'c8 c4 c4 c4 \\clef bass c4 c4 c4 c4 c1',
                'c8 c4 c4 c4 \\clef bass c4 c4 c4 c4 c1'
            ]], [3, 4, 1, 8], [-1, 3], ['bass']);

            expect(() => scoreModelToViewModel(scoreModel)).to.not.throw();
    
        });



    });    


    describe('key changes', () => {
        it('should show a key change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [{content: new SimpleSequence( 'c1 \\key g \\major c1')}]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(4);
            expect(score.staves[0].timeSlots[2]).to.deep.include({
                key: { keyPositions: [{alteration: 1, position: 2 }]}
            });
        });
    
        it('should correctly set accidentals after a key change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [{content: new SimpleSequence( '<c e f>1 \\key d \\major <c e f>1')}]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(4);
            expect(score.staves[0].timeSlots[1]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: 0,
                    position: 1
                }]
            });
            expect(score.staves[0].timeSlots[3]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: -1,
                    position: -1
                },{
                    alteration: 0,
                    displacement: 0,
                    position: 2
                }]
            });
        });
    
        it('should change key for all voices, even if they dont share the timeslot of the key change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [
                        {content: new SimpleSequence( '<c e f>2 \\key d \\major <c e f>1.')},
                        {content: new SimpleSequence( '<c, e, f,>1 <c, e, f,>1')}
                    ]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(5);
    
            expect(score.staves[0].timeSlots[1]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: 0,
                    position: 1
                },{
                    alteration: 0,
                    displacement: 0,
                    position: -6
                }]
            });
            expect(score.staves[0].timeSlots[2].key).to.deep.eq({
                keyPositions: [
                    {
                        alteration: 1,
                        position: 2
                    },
                    {
                        alteration: 1,
                        position: -1
                    }
                ]
            });
    
            expect(score.staves[0].timeSlots[3]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: -1,
                    position: -1
                },{
                    alteration: 0,
                    displacement: 0,
                    position: 2
                }]
            });
    
            expect(score.staves[0].timeSlots[4].key).to.be.undefined;
            expect(score.staves[0].timeSlots[4]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: -1,
                    position: -8
                },{
                    alteration: 0,
                    displacement: 0,
                    position: -5
                }]
            });

        });
    
        it('should change key for all staves', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [
                        {content: new SimpleSequence( '<c e f>2 \\key d \\major <c e f>1.')}
                    ]
                },{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [
                        {content: new SimpleSequence( '<c e f>2 <c e f>1.')}
                    ]
                }]
            });
    
            // First staff
            expect(score.staves[0].timeSlots).to.have.length(4);
    
            expect(score.staves[0].timeSlots[1]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: 0,
                    position: 1
                }]
            });
            expect(score.staves[0].timeSlots[2].key).to.deep.eq({
                keyPositions: [
                    {
                        alteration: 1,
                        position: 2
                    },
                    {
                        alteration: 1,
                        position: -1
                    }
                ]
            });
    
            expect(score.staves[0].timeSlots[3]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: -1,
                    position: -1
                },{
                    alteration: 0,
                    displacement: 0,
                    position: 2
                }]
            });
    
            // second staff
            expect(score.staves[1].timeSlots).to.have.length(4);
    
            expect(score.staves[1].timeSlots[1]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: 0,
                    position: 1
                }]
            });
            expect(score.staves[1].timeSlots[2].key).to.deep.eq({
                keyPositions: [
                    {
                        alteration: 1,
                        position: 2
                    },
                    {
                        alteration: 1,
                        position: -1
                    }
                ]
            });
    
            expect(score.staves[1].timeSlots[3]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: -1,
                    position: -1
                },{
                    alteration: 0,
                    displacement: 0,
                    position: 2
                }]
            });
    
    
        });
    
        it('should show a key change on all staves, even if they dont share the timeslot of the key change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [
                        {content: new SimpleSequence( '<c e f>2 \\key d \\major <c e f>1.')}
                    ]
                },{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [
                        {content: new SimpleSequence( '<c e f>1 <c e f>2')}
                    ]
                }]
            });
    
            // First staff
            expect(score.staves[0].timeSlots).to.have.length(4);
    
            expect(score.staves[0].timeSlots[1]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: 0,
                    position: 1
                }]
            });
            expect(score.staves[0].timeSlots[2].key).to.deep.eq({
                keyPositions: [
                    {
                        alteration: 1,
                        position: 2
                    },
                    {
                        alteration: 1,
                        position: -1
                    }
                ]
            });
    
            expect(score.staves[0].timeSlots[3]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: -1,
                    position: -1
                },{
                    alteration: 0,
                    displacement: 0,
                    position: 2
                }]
            });
    
            // second staff
            expect(score.staves[1].timeSlots).to.have.length(4);
    
            expect(score.staves[1].timeSlots[1]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: 0,
                    position: 1
                }]
            });
            expect(score.staves[1].timeSlots[2].key).to.deep.eq({
                keyPositions: [
                    {
                        alteration: 1,
                        position: 2
                    },
                    {
                        alteration: 1,
                        position: -1
                    }
                ]
            });
    
            expect(score.staves[1].timeSlots[2]).to.deep.include({
                absTime: getExtendedTime(Time.newAbsolute(1, 2), EventType.KeyChg)
            });
    
    
        });
   
        it('should disallow different key changes at different staves at same time', () => {
            const scoreModel: ScoreDef = {
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\key d \\major c4 c4 c4 c4 c1')}
                    ]
                },{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\key e \\minor c4 c4 c4 c4 c1')}
                    ]
                }]
            };

            expect(() => scoreModelToViewModel(scoreModel)).to.throw('Two key changes in the same staff');
    
        });

        it('should allow equal key changes at different staves at same time', () => {
            const scoreModel: ScoreDef = {
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\key d \\major c4 c4 c4 c4 c1')}
                    ]
                },{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\key d \\major c4 c4 c4 c4 c1')}
                    ]
                }]
            };

            expect(() => scoreModelToViewModel(scoreModel)).to.not.throw();
    
        });

        // todo: if a staff has individual meter/key, it should ignore global meter/key changes

    });

    describe('meter changes', () => {
        it('should show a meter change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\meter 5/8 c4 c4 c4 c4 c1')}
                    ]
                }]
            });

            //expect(score.staves[0].timeSlots).to.have.length(10);

            expect(score.staves[0].timeSlots[6].meter).to.deep.eq({ meterText: ['5', '8']});
                
        });

        it('should change bar lines after a meter change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\meter 4/4 c4 c4 c4 c4 c1')}
                    ]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(14);

            const bars = score.staves[0].timeSlots
                .map((ts, n) => ({ ts, n }))
                .filter(item => item.ts.bar)
                .map((item) => item.n);
            expect(bars).to.deep.eq([2, 6, 11, 13]);
               
        });               
    
        it('should change beaming after a meter change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4},
                    voices: [
                        {content: new SimpleSequence( 'c8 c8 c8 c8 c8 c8 \\meter 6/8 c8 c8 c8 c8 c8 c8')}
                    ]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(15);

            const beamingGroups = score.staves[0].timeSlots
                .map((ts, n) => ({ ts, n }))
                .filter(item => item.ts.beamings)
                .map((item) => item.n);
            expect(beamingGroups).to.deep.eq([1, 3, 5, 8, 11]);
            
        });               
    
        it('should change beaming after a meter change with longer notes before change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4},
                    voices: [
                        {content: new SimpleSequence( 'c2. \\meter 6/8 c8 c8 c8 c8 c8 c8')}
                    ]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(10);

            const beamingGroups = score.staves[0].timeSlots
                .map((ts, n) => ({ ts, n }))
                .filter(item => item.ts.beamings)
                .map((item) => item.n);
            expect(beamingGroups).to.deep.eq([3, 6]);
            
        });               
    
        it('should change meter for all staves, even if they dont share the timeslot of the meter change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\meter 4/4 c4 c4 c4 c4 c1')}
                    ]
                },{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c1 c4 c4 c4 c1')}
                    ]
                }]
            });

            expect(score.staves[1].timeSlots.find(ts => Time.equals(ts.absTime, getExtendedTime(Time.newAbsolute(7, 8), EventType.MeterChg)))).to.exist;
            expect(score.staves[1].timeSlots.find(ts => Time.equals(ts.absTime, getExtendedTime(Time.newAbsolute(7, 8), EventType.MeterChg)))).to.deep.include({ meter: { meterText: ['4', '4']}});
    
        });

        it('should disallow different meter changes at different staves at same time', () => {
            const scoreModel: ScoreDef = {
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\meter 4/4 c4 c4 c4 c4 c1')}
                    ]
                },{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\meter 6/8 c4 c4 c4 c4 c1')}
                    ]
                }]
            };

            expect(() => scoreModelToViewModel(scoreModel)).to.throw('Two meter changes in the same staff');
    
        });

        it('should allow equal meter changes at different staves at same time', () => {
            const scoreModel: ScoreDef = {
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\meter 6/8 c4 c4 c4 c4 c1')}
                    ]
                },{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    initialMeter: { count: 3, value: 4, upBeat: Time.newSpan(1, 8)},
                    voices: [
                        {content: new SimpleSequence( 'c8 c4 c4 c4 \\meter 6/8 c4 c4 c4 c4 c1')}
                    ]
                }]
            };

            expect(() => scoreModelToViewModel(scoreModel)).to.not.throw();
    
        });

        // beaming after meter chg

    });

});
