import { FlagType } from './note-view-model';
import { NoteType, NoteDirection } from '../../model/notes/note';
import { Staff, StaffDef } from '../../model/score/staff';
import { expect } from 'chai';
import { ClefType } from '../../model/states/clef';
import { modelToViewModel } from './convert-model';
describe('Staff', () => {
    let staffClef: StaffDef;

    beforeEach(() => { 
        staffClef = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialKey: { accidental: -1, count: 4 },
            seq: {
                elements: ''
            }
        };
    });

    it('should convert an empty staff to view model', () => {
        const vm = modelToViewModel(staffClef);

        expect(vm).to.deep.equal({
            objects: [                
                { 
                    position: 1,
                    clefType: ClefType.G,
                    line: -2
                },
                { 
                    keyPositions: [ {
                        'alternation': -1,
                        'position': 0
                    },
                    {
                        'alternation': -1,
                        'position': 3
                    },
                    {
                        'alternation': -1,
                        'position': -1
                    },
                    {
                        'alternation': -1,
                        'position': 2
                    }]
                }
            ]
        });
    });

    it('should convert a staff with notes to view model', () => {
        staffClef.seq = { elements: 'c\'1 d\'4 e\'2' };

        const vm = modelToViewModel(staffClef);

        expect(vm).to.deep.equal({
            objects: [                
                { 
                    position: 1,
                    clefType: ClefType.G,
                    line: -2
                },
                { 
                    keyPositions: [ {
                        'alternation': -1,
                        'position': 0
                    },
                    {
                        'alternation': -1,
                        'position': 3
                    },
                    {
                        'alternation': -1,
                        'position': -1
                    },
                    {
                        'alternation': -1,
                        'position': 2
                    }]
                },
                {
                    positions: [-6],
                    noteType: NoteType.NWhole,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                },
                {
                    positions: [-5],
                    noteType: NoteType.NQuarter,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                },
                {
                    positions: [-4],
                    noteType: NoteType.NHalf,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                }
            ]
        });
    });

    it('should convert a staff with one voice to view model', () => {
        staffClef.voices = [ {content: { elements: 'c\'1 d\'4 e\'2' }}];
        
        staffClef.initialKey.count = 0;

        const vm = modelToViewModel(staffClef);

        expect(vm).to.deep.equal({
            objects: [                
                { 
                    position: 1,
                    clefType: ClefType.G,
                    line: -2
                },
                { 
                    keyPositions: []
                },
                {
                    positions: [-6],
                    noteType: NoteType.NWhole,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                },
                {
                    positions: [-5],
                    noteType: NoteType.NQuarter,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                },
                {
                    positions: [-4],
                    noteType: NoteType.NHalf,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                }
            ]
        });
    });


    it('should convert a staff with two voices to view model', () => {
        staffClef.voices = [ 
            { content: { elements: 'c\'1' }, noteDirection: NoteDirection.Down },
            { content: { elements: 'e\'2 f\'2' }, noteDirection: NoteDirection.Up }
        ];

        staffClef.initialKey.count = 0;
        
        const vm = modelToViewModel(staffClef);

        expect(vm).to.deep.equal({
            objects: [                
                { 
                    position: 1,
                    clefType: ClefType.G,
                    line: -2
                },
                { 
                    keyPositions: []
                },
                {
                    positions: [-6],
                    noteType: NoteType.NWhole,
                    direction: NoteDirection.Down,
                    flagType: FlagType.None
                },
                {
                    positions: [-4],
                    noteType: NoteType.NHalf,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                },
                {
                    positions: [-3],
                    noteType: NoteType.NHalf,
                    direction: NoteDirection.Up,
                    flagType: FlagType.None
                }
            ]
        });
    });
});