import { Clef } from './../../model/states/clef';
import { Staff } from './../../model/score/staff';
import { Time } from './../../model/rationals/time';
import { FlagType } from './note-view-model';
import { NoteType, NoteDirection } from '../../model/notes/note';
import { StaffDef } from '../../model/score/staff';
import { expect } from 'chai';
import { ClefType } from '../../model/states/clef';
import { staffModelToViewModel } from './convert-model';
describe('Staff view model', () => {
    let staffClef: StaffDef;

    beforeEach(() => { 
        staffClef = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialKey: { accidental: -1, count: 4 },
            voices: []
        };
    });

    it('should change positions after a clef change', () => {
        Staff.setSequence(staffClef, {elements: 'c\'4 \\clef alto c\'4 \\clef bass c\'4'});

        const vm = staffModelToViewModel(staffClef);

        expect(vm.timeSlots.length).to.eq(3);
        expect(vm.timeSlots[0].notes[0]).to.deep.include({ positions: [-6] });
        expect(vm.timeSlots[1].clef).to.deep.include({clefType: ClefType.C, line: 0});
        expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [0] });
        expect(vm.timeSlots[2].notes[0]).to.deep.include({ positions: [6] });
    });


    it('should also change positions in another voice after a clef change', () => {
        Staff.setSequence(staffClef, {elements: 'c\'4 \\clef alto c\'4 \\clef bass c\'4'});
        staffClef.voices.push({content: { elements: 'b4 b4 b4'}});

        const vm = staffModelToViewModel(staffClef);

        expect(vm.timeSlots.length).to.eq(3);
        expect(vm.timeSlots[0].notes[0]).to.deep.include({ positions: [-6] });
        expect(vm.timeSlots[1].notes[0]).to.deep.include({ positions: [0] });
        expect(vm.timeSlots[2].notes[0]).to.deep.include({ positions: [6] });

        expect(vm.timeSlots[0].notes[1]).to.deep.include({ positions: [-7] });
        expect(vm.timeSlots[1].notes[1]).to.deep.include({ positions: [-1] });
        expect(vm.timeSlots[2].notes[1]).to.deep.include({ positions: [5] });

    });    
});
