import { BarType } from './score-view-model';
import { SimpleSequence } from './../../model/score/sequence';
import { IndexedMap } from './../../tools/time-map';
import { StateChange } from './../../model/states/state';
import { Staff } from './../../model/score/staff';
import { Time } from './../../model/rationals/time';
import { FlagType } from './note-view-model';
import { NoteType, NoteDirection } from '../../model/notes/note';
import { StaffDef } from '../../model/score/staff';
import { expect } from 'chai';
import { ClefType } from '../../model/states/clef';
import { __internal } from './convert-model';
import { TimeMap } from '../../tools/time-map';
import { createScopedTimeMap } from './state-map';
describe('Staff view model', () => {
    let staffClef: StaffDef;

    beforeEach(() => { 
        staffClef = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialKey: { accidental: -1, count: 4 },
            voices: []
        };
    });



    it('should convert an empty staff to view model', () => {

        Staff.setSequence(staffClef, new SimpleSequence(''));

        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());

        expect(vm).to.deep.equal({
            timeSlots: [
                { 
                    absTime: Time.newExtendedTime(0, 1, -15000), 
                    clef:{ 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key: { 
                        keyPositions: [ {
                            'alteration': -1,
                            'position': 0
                        },
                        {
                            'alteration': -1,
                            'position': 3
                        },
                        {
                            'alteration': -1,
                            'position': -1
                        },
                        {
                            'alteration': -1,
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
        Staff.setSequence(staffClef, new SimpleSequence( 'c\'1 des\'4 ees\'2'));

        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());

        expect(vm).to.deep.equal({
            timeSlots: [
                {
                    absTime: Time.newExtendedTime(0, 1, -15000), 
                    clef:    { 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key: { keyPositions: [ {
                        'alteration': -1,
                        'position': 0
                    },
                    {
                        'alteration': -1,
                        'position': 3
                    },
                    {
                        'alteration': -1,
                        'position': -1
                    },
                    {
                        'alteration': -1,
                        'position': 2
                    }]
                    },
                    notes: []
                },
                { 
                    absTime: Time.newAbsolute(0, 1), 
                    notes: [
                        {
                            positions: [-6],
                            noteType: NoteType.NWhole,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None,
                            uniq: '0-0-0'
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
                            flagType: FlagType.None,
                            uniq: '0-0-1'
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
                            flagType: FlagType.None,
                            uniq: '0-0-2'
                        }
                    ]
                }
            ]
        });
    });

    it('should convert a staff with one voice to view model', () => {
        staffClef.voices = [ {content: new SimpleSequence( 'c\'1 d\'4 e\'2' )}];
        
        staffClef.initialKey.count = 0;

        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());

        expect(vm).to.deep.equal({
            timeSlots: [
                {
                    absTime: Time.newExtendedTime(0, 1, -15000), 
                    clef:    { 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key:    { 
                        keyPositions: []
                    },
                    notes: []
                },

                { 
                    absTime: Time.newAbsolute(0, 1), 
         
                    notes: [                

                        {
                            positions: [-6],
                            noteType: NoteType.NWhole,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None,
                            uniq: '0-0-0'
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
                            flagType: FlagType.None,
                            uniq: '0-0-1'
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
                            flagType: FlagType.None,
                            uniq: '0-0-2'
                        }
                    ]
                }
            ]
        });
    });


    it('should convert a staff with two voices to view model', () => {
        staffClef.voices = [ 
            { content: new SimpleSequence( 'c\'1' ), noteDirection: NoteDirection.Down },
            { content: new SimpleSequence( 'e\'2 f\'2' ), noteDirection: NoteDirection.Up }
        ];

        staffClef.initialKey.count = 0;
        
        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());

        expect(vm).to.deep.equal({
            timeSlots: [
                {
                    absTime: Time.newExtendedTime(0, 1, -15000), 
                    clef:    { 
                        position: 1,
                        clefType: ClefType.G,
                        line: -2
                    },
                    key:    { 
                        keyPositions: []
                    },
                    notes: []
                },
                { 
                    absTime: Time.newAbsolute(0, 1), 
                    notes: [
                        {
                            positions: [-6],
                            noteType: NoteType.NWhole,
                            direction: NoteDirection.Down,
                            flagType: FlagType.None,
                            uniq: '0-0-0'
                        },
                        {
                            positions: [-4],
                            noteType: NoteType.NHalf,
                            direction: NoteDirection.Up,
                            flagType: FlagType.None,
                            uniq: '0-1-0'
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
                            flagType: FlagType.None,
                            uniq: '0-1-1'
                        }
        
                    ]
                }
            ]
        });
    });

    it('should convert a staff with a meter to view model', () => {
        
        Staff.setSequence(staffClef, new SimpleSequence( 'c\'1 d\'4 e\'2' ));
        staffClef.initialMeter = { count: 12, value: 8 };

        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());

        expect(vm.timeSlots[0].meter).to.deep.equal({
                    
            meterText: ['12', '8']
            
        });
    });


    it('should add bar lines', () => {
        staffClef.voices = [ {content: new SimpleSequence( 'c\'4 d\'4 e\'4 c\'2. d\'4' )}];
        
        staffClef.initialKey.count = 0;
        staffClef.initialMeter = {count: 3, value: 4};

        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());
        expect(vm.timeSlots.length).to.equal(8);

        for (let i = 0; i < 5; i++) {
            if (i === 4 || i === 6){
                expect(vm.timeSlots[i].bar).to.deep.equal({ barType: BarType.Simple });
            } else {
                expect(vm.timeSlots[i].bar).to.be.undefined;
            }
        }
        
    });

    it('should add bar lines even when no other events at time', () => {
        staffClef.voices = [ {content: new SimpleSequence( 'c\'1' )}];
        
        staffClef.initialKey.count = 0;
        staffClef.initialMeter = {count: 2, value: 4};

        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());
        expect(vm.timeSlots.length).to.equal(4);

        for (let i = 0; i < 3; i++) {
            if (i <= 1) {
                expect(vm.timeSlots[i].bar).to.be.undefined;
            } else
                expect(vm.timeSlots[i].bar).to.deep.equal({ barType: BarType.Simple });
        }
        
    });


    it('should add bar lines when an upbeat is defined', () => {
        staffClef.voices = [ {content: new SimpleSequence( 'c\'4 d\'4 e\'4 c\'4 d\'4 e\'4 e\'4' )}];
        
        staffClef.initialKey.count = 0;
        staffClef.initialMeter = {count: 3, value: 4, upBeat: Time.QuarterTime};

        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());
        expect(vm.timeSlots.length).to.equal(11);

        for (let i = 0; i < 8; i++) {
            if (i === 2 || i === 6 || i === 10){
                expect(vm.timeSlots[i].bar).to.deep.equal({ barType: BarType.Simple });
            } else {
                expect(vm.timeSlots[i].bar).to.be.undefined;
            }
        }
        
    });

    it('should convert a tied note to view model', () => {
        staffClef.voices = [ {content: new SimpleSequence( 'c\'2~ c\'8' )}];
        staffClef.voices[0].noteDirection = NoteDirection.Up;
        
        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());
        expect(vm.timeSlots.length).to.equal(3);

        expect(vm.timeSlots[1].ties).to.deep.equal([
            { position: -6, direction: NoteDirection.Up, toTime: Time.newAbsolute(1, 2) }
        ]);

    });

    
    it('should make two-chord ties to view model', () => {
        staffClef.voices = [ 
            {content: new SimpleSequence( 'e\'2~ e\'8' )},
            {content: new SimpleSequence( 'c\'2~ c\'8' )}
        ];
        staffClef.voices[0].noteDirection = NoteDirection.Up;
        staffClef.voices[1].noteDirection = NoteDirection.Down;
        
        const vm = __internal.staffModelToViewModel(staffClef, createScopedTimeMap());
        expect(vm.timeSlots.length).to.equal(3);

        expect(vm.timeSlots[1].ties).to.deep.equal([
            { position: -4, direction: NoteDirection.Up, toTime: Time.newAbsolute(1, 2) },
            { position: -6, direction: NoteDirection.Down, toTime: Time.newAbsolute(1, 2) }
        ]);

    });

});