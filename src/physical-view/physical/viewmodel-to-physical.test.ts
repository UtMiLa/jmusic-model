import { KeyViewModel } from './../../logical-view/view-model/convert-key';
import { MeterViewModel } from './../../logical-view/view-model/convert-meter';
import { Clef } from './../../model/states/clef';
import { TimeSlotViewModel, ClefViewModel } from './../../logical-view/view-model/convert-model';
import { TimeSlot } from './../../model/score/sequence';
import { Accidental } from './../../model/pitches/pitch';
import { Time } from './../../model/rationals/time';
import { HorizVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { ClefType } from '~/model/states/clef';
import { PhysicalElementBase, PhysicalVertVarSizeElement } from './physical-elements';
import { Metrics, StandardMetrics } from './metrics';
import { VertVarSizeGlyphs, FixedSizeGlyphs } from './glyphs';
import { expect } from 'chai';
import { viewModelToPhysical } from './viewmodel-to-physical';
import { ScoreViewModel } from '../../logical-view/view-model/convert-model';
import { staffLineToY } from './functions';
import { getTimeSlotWidth, MeasureMap } from './measure-map';

describe('Physical model', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            staffLineWidth: 6,
            staffLengthOffset: 8,
            defaultSpacing: 30
        });
    });

    function checkStaffLines(elements: PhysicalElementBase[], from: number, width: number, length: number, no = 5): void {

        for (let i = 0; i < no; i++) {
            const element: PhysicalVertVarSizeElement = elements[from + i] as PhysicalVertVarSizeElement;

            expect(element.element).to.equal(VertVarSizeGlyphs.Line);
            expect(element.position).to.deep.equal({ x: 0, y: (no - i - 1) * width });
        }
    }

    it('should convert an empty view model', () => {
        const viewModel: ScoreViewModel = { staves: [] };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel).to.deep.equal({ elements: [] });
    });



    it('should convert a view model with an empty staff', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                { 
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            notes: [] } 
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        const lineWidth = defaultMetrics.staffLineWidth;

        expect(physicalModel).to.deep.include({ elements: [
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 4 * lineWidth },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 3 * lineWidth },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 2 * lineWidth },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: lineWidth },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 0 },
                length: 0
            }
        ] });

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, 10);
    });
    
   
    it('should convert a staff position to a y value', () => {

        const lineIdxes = [-2, -1, 0, 1, 2]; // staff lines from bottom to top

        const defaultYs = lineIdxes.map(idx => staffLineToY(idx, defaultMetrics));
        const alternateYs = lineIdxes.map(idx => staffLineToY(idx, alternativeMetrics));

        expect(defaultYs).to.deep.equal([
            0, 
            defaultMetrics.staffLineWidth, 
            defaultMetrics.staffLineWidth*2,
            defaultMetrics.staffLineWidth*3,
            defaultMetrics.staffLineWidth*4
        ]);  
        expect(alternateYs).to.deep.equal([
            0, 
            alternativeMetrics.staffLineWidth, 
            alternativeMetrics.staffLineWidth*2,
            alternativeMetrics.staffLineWidth*3,
            alternativeMetrics.staffLineWidth*4
        ]);        
    });
    
   
    /* staff line length is a complicated matter! 
    This test is not relevant, since width of empty notes array is 0.
     it('should size staff lines from settings', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                { 
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            notes: [] 
                        } 
                    ]
                }
            ]
        };

        const settings = new StandardMetrics({
            staffLineWidth: 50,
            staffLengthOffset: 30
        });

        const physicalModel = viewModelToPhysical(viewModel, settings);

        const lineWidth = 50;

        expect(physicalModel).to.deep.equal({ elements: [
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 4 * lineWidth },
                length: 30
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 3 * lineWidth },
                length: 30
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 2 * lineWidth },
                length: 30
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: lineWidth },
                length: 30
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 0 },
                length: 30
            }
        ] });

        checkStaffLines(physicalModel.elements, 0, 50, 30);
    });*/


    
    it('should convert a view model with a staff with a clef', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:    { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },      
                            notes: [                

                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, 30);

        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'clefs.G',
            position: { x: 10, y: defaultMetrics.staffLineWidth }
        });
    });
    
    it('should convert a view model with a staff with a clef and one note', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:    { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },             
                            notes: [                
                   
                                {
                                    positions: [-5],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 2);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, 50);

        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'clefs.G',
            position: { x: 10, y: defaultMetrics.staffLineWidth }
        });

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 30, y: -0.5 * defaultMetrics.staffLineWidth }
        });
    });
   
    it('should convert note values correctly', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef: { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },       
                            notes: [                

                                {
                                    positions: [-5],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(2, 1), 
                            notes: [
        
                                {
                                    positions: [-5],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(3, 1), 
                            notes: [
        
                                {
                                    positions: [-5],
                                    noteType: NoteType.NHalf,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(7, 2), 
                            notes: [
        
                                {
                                    positions: [-5],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 4 + 2);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, 110);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 30, y: -0.5 * defaultMetrics.staffLineWidth }
        });

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 50, y: -0.5 * defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 70, y: -0.5 * defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 90, y: -0.5 * defaultMetrics.staffLineWidth }
        });


        // stems
        expect(physicalModel.elements[8]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            length: defaultMetrics.quarterStemDefaultLength,
            position: { x: 70 + defaultMetrics.halfNoteHeadLeftXOffset, y: -0.5 * defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[10]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            length: defaultMetrics.quarterStemDefaultLength,
            position: { x: 90 + defaultMetrics.blackNoteHeadLeftXOffset, y: -0.5 * defaultMetrics.staffLineWidth }
        });

    });
   

    it('should convert note pitches correctly', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:          { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },  
                            notes: [                

                                {
                                    positions: [0],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(2, 1), 
                            notes: [
        
                                {
                                    positions: [-1],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(3, 1), 
                            notes: [
        
                                {
                                    positions: [-2],
                                    noteType: NoteType.NHalf,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(7, 2), 
                            notes: [
        
                                {
                                    positions: [-3],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 4 + 2);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, 110);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 30, y: 2*defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 50, y: 1.5*defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 70, y: defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 90, y: 0.5*defaultMetrics.staffLineWidth }
        });
    });
   

    it('should convert accidentals correctly', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:          { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },  
                            notes: [                

                                {
                                    positions: [0],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(2, 1), 
                            accidentals: [{ 
                                alternation: 1,
                                position: -1,
                                displacement: 0
                            }],
                            notes: [
        
                                {
                                    positions: [-1],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                },
                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 1 + 2);

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'accidentals.2',
            position: { x: 50, y: 1.5*defaultMetrics.staffLineWidth }
        });

    });
   

    it('should convert note pitches correctly using alternative spacing', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:    { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },        
                            notes: [                

                                {
                                    positions: [0],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(2, 1), 
                            notes: [
        
                                {
                                    positions: [-1],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(3, 1), 
                            notes: [
        
                                {
                                    positions: [-2],
                                    noteType: NoteType.NHalf,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(7, 2), 
                            notes: [
        
                                {
                                    positions: [-3],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, alternativeMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 4 + 2);

        checkStaffLines(physicalModel.elements, 0, alternativeMetrics.staffLineWidth, 158);

        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'clefs.G',
            position: { x: 10, y: alternativeMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 10 + alternativeMetrics.defaultSpacing, y: 2*alternativeMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 10 + alternativeMetrics.defaultSpacing*2, y: 1.5*alternativeMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 10 + alternativeMetrics.defaultSpacing*3, y: alternativeMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 10 + alternativeMetrics.defaultSpacing*4, y: 0.5*alternativeMetrics.staffLineWidth }
        });
    });


    it('should convert note pitches correctly in bass clef', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:    { 
                                position: 1,
                                clefType: ClefType.F,
                                line: 2
                            },        
                            notes: [                

                                {
                                    positions: [0],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                },
                                {
                                    positions: [-1],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                },
                                {
                                    positions: [-2],
                                    noteType: NoteType.NHalf,
                                    direction: NoteDirection.Up
                                },
                                {
                                    positions: [-3],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    });

    it('should identify and convert a key signature', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            key:    { 
                                keyPositions: [{ alternation: -1, position: 3}]
                            },        
                            notes: [                

                                {
                                    positions: [0],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    
        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 1);

        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'accidentals.M2',
            position: { x: 10, y: 3.5 * defaultMetrics.staffLineWidth }
        });
    });
   

    it('should convert a view model with a staff with a clef and a meter', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:    { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },
                            meter: {
                                meterText: ['5', '4']
                            },
                            notes: [                

                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 2);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, 30);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'five',
            position: { x: 30, y: 2 * defaultMetrics.staffLineWidth + defaultMetrics.meterAdjustY }
        });

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'four',
            position: { x: 30, y: defaultMetrics.meterAdjustY }
        });
    });
    
    it('should convert a view model with a staff with a clef, a key and a meter', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            clef:    { 
                                position: 1,
                                clefType: ClefType.G,
                                line: -2
                            },
                            key: {
                                keyPositions: [{ alternation: -1, position: 3}, { alternation: -1, position: 6}]
                            },
                            meter: {
                                meterText: ['5', '4']
                            },
                            notes: [                

                            ]
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 2 + 2);

        expect(physicalModel.elements[8]).to.deep.eq({
            glyph: 'five',
            position: { x: 30 + 2 * defaultMetrics.keySigSpacing + defaultMetrics.defaultSpacing, y: 2 * defaultMetrics.staffLineWidth + defaultMetrics.meterAdjustY }
        });

        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'four',
            position: { x: 30 + 2 * defaultMetrics.keySigSpacing + defaultMetrics.defaultSpacing, y: defaultMetrics.meterAdjustY }
        });
    });
   
    
   

    it('should render a bar view model', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                { 
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            notes: [
                                {
                                    positions: [0],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                }
                            ] 
                        },
                        { 
                            absTime: Time.newAbsolute(1, 1), 
                            bar: true,
                            notes: [] 
                        } 
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        const lineWidth = defaultMetrics.staffLineWidth;

        expect(physicalModel.elements.length).to.eq(7);

        expect(physicalModel.elements[6]).to.deep.equal(
            { 
                element: HorizVarSizeGlyphs.Bar,
                position: { x: 30, y: 0 },
                length: 4 * lineWidth
            }
        );

    });
    
    

    it('should render a tie', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                { 
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            ties: [
                                { position: -6, direction: NoteDirection.Down },
                                { position: -4, direction: NoteDirection.Up }
                            ],
                            notes: [                                {
                                positions: [0],
                                noteType: NoteType.NWhole,
                                direction: NoteDirection.Up
                            },] 
                        } 
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(8);

        expect(physicalModel.elements[6]).to.deep.equal(
            { 
                element: VertVarSizeGlyphs.Tie,
                position: { x: 10 + defaultMetrics.tieAfterNote, y: -defaultMetrics.staffLineWidth },
                direction: NoteDirection.Down,
                length: 12
            }
        );

        expect(physicalModel.elements[7]).to.deep.equal(

            { 
                element: VertVarSizeGlyphs.Tie,
                position: { x: 10 + defaultMetrics.tieAfterNote, y: 0 },
                direction: NoteDirection.Up,
                length: 12
            }
        );

    });
    
    describe('Widths', () => {
        it('should calculate the width of an empty timeslot', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                notes: []
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(0);
        });

        it('should calculate the width of a clef', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                clef: { clefType: ClefType.G, line: 2 } as ClefViewModel,
                notes: []
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing);
        });        

        it('should calculate the width of a meter', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                meter: { meterText: ['3', '4'] } as MeterViewModel,
                notes: []
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing);
        });        

        it('should calculate the width of a key', () => {
            const timeSlot1: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                key: { keyPositions: [{ alternation: -1, position: 1 }] } as KeyViewModel,
                notes: []
            };
            const res = getTimeSlotWidth(timeSlot1, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing + 1 * defaultMetrics.keySigSpacing);

            const timeSlot2: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                key: { keyPositions: [
                    { alternation: 1, position: 1 },
                    { alternation: 1, position: 2 },
                    { alternation: 1, position: 3 },
                    { alternation: 1, position: 4 },
                    { alternation: 1, position: 5 },
                    { alternation: 1, position: 6 },
                    { alternation: 1, position: 7 }
                ] } as KeyViewModel,
                notes: []
            };
            const res2 = getTimeSlotWidth(timeSlot2, defaultMetrics);

            expect(res2).to.eq(defaultMetrics.defaultSpacing + 7 * defaultMetrics.keySigSpacing);

        });

        it('should calculate the width of a bar', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                bar: true,
                notes: []
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(defaultMetrics.afterBarSpacing);
        });        

        it('should calculate the width of a note', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                notes: [{noteType: NoteType.NWhole, positions: [1], direction: NoteDirection.Undefined }]
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing);
        });        

        it('should calculate the width of a note with accidental', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1, 1),
                accidentals: [{position: 1, alternation: -1, displacement: 0}],
                notes: [{noteType: NoteType.NWhole, positions: [1], direction: NoteDirection.Undefined }]
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing + defaultMetrics.accidentalSpacing);
        });        

        
        
        it('should calculate the width of the whole timeslot', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                clef: { clefType: ClefType.G, line: 2 } as ClefViewModel,
                bar: true,
                key: { keyPositions: [{ alternation: -1, position: 1 }] } as KeyViewModel,
                meter: { meterText: ['3', '4'] } as MeterViewModel,
                notes: [{noteType: NoteType.NWhole, positions: [1], direction: NoteDirection.Undefined }]
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing + defaultMetrics.afterBarSpacing
                + defaultMetrics.defaultSpacing + 1 * defaultMetrics.keySigSpacing
                + defaultMetrics.defaultSpacing + defaultMetrics.defaultSpacing);
        });       


        it('should calculate the width combining two staves', () => {
            const timeSlot1: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                notes: [{noteType: NoteType.NWhole, positions: [1], direction: NoteDirection.Undefined }]
            };
            const w1 = getTimeSlotWidth(timeSlot1, defaultMetrics);

            const timeSlot2: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                accidentals: [{ alternation: -1, position: 1, displacement: 0 }],
                notes: [{noteType: NoteType.NWhole, positions: [1], direction: NoteDirection.Undefined }]
            };
            const w2 = getTimeSlotWidth(timeSlot2, defaultMetrics);

            expect(w1).to.eq(defaultMetrics.defaultSpacing);
            expect(w2).to.eq(defaultMetrics.defaultSpacing + defaultMetrics.accidentalSpacing);

            const mm1 = MeasureMap.generate({timeSlots: [timeSlot1]}, defaultMetrics);
            const mm2 = MeasureMap.generate({timeSlots: [timeSlot2]}, defaultMetrics);

            expect(mm1.measureMap[0].width).to.eq(defaultMetrics.defaultSpacing);
            expect(mm2.measureMap[0].width).to.eq(defaultMetrics.defaultSpacing + defaultMetrics.accidentalSpacing);

            const mm = mm1.mergeWith(mm2);

            //console.log(mm);

            expect(mm.measureMap[0].width).to.eq(defaultMetrics.defaultSpacing + defaultMetrics.accidentalSpacing);
            

        });       

    });
});