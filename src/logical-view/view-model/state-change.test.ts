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
            Staff.setSequence(staffClef, {elements: 'c\'4 \\clef alto c\'4 \\clef bass c\'4'});
    
            const vm = scoreModelToViewModel({staves: [staffClef]}).staves[0];
    
            expect(vm.timeSlots.length).to.eq(3);
            expect(vm.timeSlots[0].notes[0]).to.deep.include({ positions: [-6] });
            expect(vm.timeSlots[1].clef).to.deep.include({clefType: ClefType.C, line: 0});
            expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [0] });
            expect(vm.timeSlots[2].notes[0]).to.deep.include({ positions: [6] });
        });
               
    
        it('should also change positions in another voice after a clef change', () => {
            Staff.setSequence(staffClef, {elements: 'c\'4 \\clef alto c\'4 \\clef bass c\'4'});
            staffClef.voices.push({content: { elements: 'b4 b4 b4'}});
    
            const vm = scoreModelToViewModel({staves: [staffClef]}).staves[0];
    
            expect(vm.timeSlots.length).to.eq(3);
            expect(vm.timeSlots[0].notes[0]).to.deep.include({ positions: [-6] });
            expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [0] });
            expect(vm.timeSlots[2].notes[0]).to.deep.include({ positions: [6] });
    
            expect(vm.timeSlots[0].notes[1]).to.deep.include({ positions: [-7] });
            expect(vm.timeSlots[1].notes[1]).to.deep.include({ positions: [-1] });
            expect(vm.timeSlots[2].notes[1]).to.deep.include({ positions: [5] });
    
        });
    
    
        it('should change clef for all voices, even if they dont share the timeslot of the clef change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [
                        {content: {elements: 'c2 \\clef C c1.'}},
                        {content: {elements: 'c1 c1'}}
                    ]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(3);
    
            expect(score.staves[0].timeSlots[0].notes.map(ts => ts.positions)).to.deep.eq(
                [ [-1],[-1] ]
            );
            expect(score.staves[0].timeSlots[1].clef).to.deep.include({
                change: true,
                clefType: ClefType.C,
                line: 0
            });
    
            expect(score.staves[0].timeSlots[1].notes.map(ts => ts.positions)).to.deep.eq(
                [[-7]]
            );
    
            expect(score.staves[0].timeSlots[2].clef).to.be.undefined;

            expect(score.staves[0].timeSlots[2].notes.map(ts => ts.positions)).to.deep.eq(
                [[-7]]
            );
                
        });
    

        it('should also change positions in another voice after a clef change', () => {
            Staff.setSequence(staffClef, {elements: 'c\'4 \\clef alto c\'4 \\clef bass c\'4'});
            staffClef.voices.push({content: { elements: 'b4 b4 b4'}});

            const vm = scoreModelToViewModel({staves: [staffClef]}).staves[0];

            expect(vm.timeSlots.length).to.eq(3);
            expect(vm.timeSlots[0].notes[0]).to.deep.include({ positions: [-6] });
            expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [0] });
            expect(vm.timeSlots[2].notes[0]).to.deep.include({ positions: [6] });

            expect(vm.timeSlots[0].notes[1]).to.deep.include({ positions: [-7] });
            expect(vm.timeSlots[1].notes[1]).to.deep.include({ positions: [-1] });
            expect(vm.timeSlots[2].notes[1]).to.deep.include({ positions: [5] });

        });    

        it('should allow different clef changes at different staves at same time', () => {
            const staff2 = {...staffClef};

            Staff.setSequence(staffClef, {elements: 'c\'4 \\clef alto c\'4 \\clef bass c\'4'});
            staffClef.voices.push({content: { elements: 'b4 b4 b4'}});

            Staff.setSequence(staff2, {elements: 'c\'4 \\clef bass c\'4 \\clef bass c\'4'});
            staff2.voices.push({content: { elements: 'b4 b4 b4'}});

            const scoreDef = {staves: [staffClef, staff2]};

            const vm = scoreModelToViewModel(scoreDef);

            expect(vm.staves[0].timeSlots).to.have.length(3);

        });
        

    });    


    describe('key changes', () => {
        it('should show a key change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [{content: {elements: 'c1 \\key g \\major c1'}}]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(2);
            expect(score.staves[0].timeSlots[1]).to.deep.include({
                key: { keyPositions: [{alteration: 1, position: 2 }]}
            });
        });
    
        it('should correctly set accidentals after a key change', () => {
            const score = scoreModelToViewModel({
                staves: [{
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: -1, count: 3 },
                    voices: [{content: {elements: '<c e f>1 \\key d \\major <c e f>1'}}]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(2);
            expect(score.staves[0].timeSlots[0]).to.deep.include({
                accidentals: [{
                    alteration: 0,
                    displacement: 0,
                    position: 1
                }]
            });
            expect(score.staves[0].timeSlots[1]).to.deep.include({
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
                        {content: {elements: '<c e f>2 \\key d \\major <c e f>1.'}},
                        {content: {elements: '<c, e, f,>1 <c, e, f,>1'}}
                    ]
                }]
            });
    
            expect(score.staves[0].timeSlots).to.have.length(3);
    
            expect(score.staves[0].timeSlots[0]).to.deep.include({
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
            expect(score.staves[0].timeSlots[1].key).to.deep.eq({
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
    
            expect(score.staves[0].timeSlots[1]).to.deep.include({
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
    
            expect(score.staves[0].timeSlots[2].key).to.be.undefined;
            expect(score.staves[0].timeSlots[2]).to.deep.include({
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
    
        it('should change key for all staves');
    
        it('should show a key change on all staves, even if they dont share the timeslot of the key change');
   
        // todo: peekLatest should find latest change in this scope
    });



});
