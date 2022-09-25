import { Time } from './../../model/rationals/time';
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
            timeSlots: [
                { 
                    absTime: Time.newAbsolute(0, 1), 
                    clef:{ 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key: { 
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

                    notes: [                
                    ]
                }
            ]
        });
    });

    it('should convert a staff with notes to view model', () => {
        staffClef.seq = { elements: 'c\'1 d\'4 e\'2' };

        const vm = modelToViewModel(staffClef);

        expect(vm).to.deep.equal({
            timeSlots: [
                { 
                    absTime: Time.newAbsolute(0, 1), 
                    clef:    { 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key: { keyPositions: [ {
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
                    notes: [
                        {
                            positions: [-6],
                            noteType: NoteType.NWhole,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None
                        }
                    ]
                },
                {
                    absTime: Time.newAbsolute(1, 1), 
                    notes: [

                        {
                            positions: [-5],
                            noteType: NoteType.NQuarter,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None
                        }
                    ]
                },
                {
                    absTime: Time.newAbsolute(5, 4), 
                    notes: [

                        {
                            positions: [-4],
                            noteType: NoteType.NHalf,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None
                        }
                    ]
                }
            ]
        });
    });

    it('should convert a staff with one voice to view model', () => {
        staffClef.voices = [ {content: { elements: 'c\'1 d\'4 e\'2' }}];
        
        staffClef.initialKey.count = 0;

        const vm = modelToViewModel(staffClef);

        expect(vm).to.deep.equal({
            timeSlots: [
                { 
                    absTime: Time.newAbsolute(0, 1), 
                    clef:    { 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key:    { 
                        keyPositions: []
                    },                    
                    notes: [                

                        {
                            positions: [-6],
                            noteType: NoteType.NWhole,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None
                        }
                    ]
                },
                {
                    absTime: Time.newAbsolute(1, 1), 
                    notes: [
                        {
                            positions: [-5],
                            noteType: NoteType.NQuarter,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None
                        }
                    ]
                },
                {
                    absTime: Time.newAbsolute(5, 4), 
                    notes: [
                        {
                            positions: [-4],
                            noteType: NoteType.NHalf,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None
                        }
                    ]
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
            timeSlots: [
                { 
                    absTime: Time.newAbsolute(0, 1), 
                    clef:    { 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key:    { 
                        keyPositions: []
                    },
                    notes: [

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
                        }    
                    ]
                },
                { 
                    absTime: Time.newAbsolute(1, 2), 
                    notes: [
                        {
                            positions: [-3],
                            noteType: NoteType.NHalf,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None
                        }
        
                    ]
                }
            ]
        });
    });

    it('should convert a staff with a meter to view model', () => {
        staffClef.seq = { elements: 'c\'1 d\'4 e\'2' };
        staffClef.initialMeter = { count: 12, value: 8 };

        const vm = modelToViewModel(staffClef);

        expect(vm.timeSlots[0].meter).to.deep.equal({
                    
            meterText: ['12', '8']
            
        });
    });


    it('should add bar lines', () => {
        staffClef.voices = [ {content: { elements: 'c\'4 d\'4 e\'4 c\'2. d\'4' }}];
        
        staffClef.initialKey.count = 0;
        staffClef.initialMeter = {count: 3, value: 4};

        const vm = modelToViewModel(staffClef);
        expect(vm.timeSlots.length).to.equal(5);

        for (let i = 0; i < 5; i++) {
            if (i === 3 || i === 4){
                expect(vm.timeSlots[i].bar).to.equal(true);
            } else {
                expect(vm.timeSlots[i].bar).to.be.undefined;
            }
        }
        
    });

    it('should add bar lines even when no other events at time', () => {
        staffClef.voices = [ {content: { elements: 'c\'1' }}];
        
        staffClef.initialKey.count = 0;
        staffClef.initialMeter = {count: 2, value: 4};

        const vm = modelToViewModel(staffClef);
        expect(vm.timeSlots.length).to.equal(3);

        for (let i = 0; i < 3; i++) {
            if (i === 0) {
                expect(vm.timeSlots[i].bar).to.be.undefined;
            } else
                expect(vm.timeSlots[i].bar).to.equal(true);
        }
        
    });


    it('should add bar lines when an upbeat is defined', () => {
        staffClef.voices = [ {content: { elements: 'c\'4 d\'4 e\'4 c\'4 d\'4 e\'4 e\'4' }}];
        
        staffClef.initialKey.count = 0;
        staffClef.initialMeter = {count: 3, value: 4, upBeat: Time.newSpan(1, 4)};

        const vm = modelToViewModel(staffClef);
        expect(vm.timeSlots.length).to.equal(8);

        for (let i = 0; i < 8; i++) {
            if (i === 1 || i === 4 || i === 7){
                expect(vm.timeSlots[i].bar).to.equal(true);
            } else {
                expect(vm.timeSlots[i].bar).to.be.undefined;
            }
        }
        
    });

    it('should convert a tied note to view model', () => {
        staffClef.voices = [ {content: { elements: 'c\'2~ c\'8' }}];
        staffClef.voices[0].noteDirection = NoteDirection.Up;
        
        const vm = modelToViewModel(staffClef);
        expect(vm.timeSlots.length).to.equal(2);

        expect(vm.timeSlots[0].ties).to.deep.equal([
            { position: -6, direction: NoteDirection.Up }
        ]);

    });

    
    it('should make two-chord ties to view model', () => {
        staffClef.voices = [ 
            {content: { elements: 'e\'2~ e\'8' }},
            {content: { elements: 'c\'2~ c\'8' }}
        ];
        staffClef.voices[0].noteDirection = NoteDirection.Up;
        staffClef.voices[1].noteDirection = NoteDirection.Down;
        
        const vm = modelToViewModel(staffClef);
        expect(vm.timeSlots.length).to.equal(2);

        expect(vm.timeSlots[0].ties).to.deep.equal([
            { position: -4, direction: NoteDirection.Up },
            { position: -6, direction: NoteDirection.Down }
        ]);

    });

});