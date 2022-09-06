import { NoteType, NoteDirection } from './../notes/note';
import { Staff, StaffDef } from './staff';
import { expect } from 'chai';
import { ClefType } from '~/states/clef';
describe('Staff', () => {
    let staffClef: StaffDef;

    beforeEach(() => { 
        staffClef = {
            initialClef: { clefType: ClefType.G, line: -2 },
            seq: {
                elements: ''
            }
        };
    });

    it('should convert an empty staff to view model', () => {
        const vm = Staff.defToViewModel(staffClef);

        expect(vm).to.deep.equal({
            objects: [                
                { 
                    position: 1,
                    clefType: ClefType.G,
                    line: -2
                }
            ]
        });
    });

    it('should convert a staff with notes to view model', () => {
        staffClef.seq.elements = 'c\'1 d\'4 e\'2';

        const vm = Staff.defToViewModel(staffClef);

        expect(vm).to.deep.equal({
            objects: [                
                { 
                    position: 1,
                    clefType: ClefType.G,
                    line: -2
                },
                {
                    positions: [-6],
                    noteType: NoteType.NWhole,
                    direction: NoteDirection.Up
                },
                {
                    positions: [-5],
                    noteType: NoteType.NQuarter,
                    direction: NoteDirection.Up
                },
                {
                    positions: [-4],
                    noteType: NoteType.NHalf,
                    direction: NoteDirection.Up
                }
            ]
        });
    });
});