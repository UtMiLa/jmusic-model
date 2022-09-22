import { Accidental } from './../../model/pitches/pitch';
import { Time } from './../../model/rationals/time';
import { HorizVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { ClefType } from '~/model/states/clef';
import { PhysicalElementBase } from './physical-elements';
import { Metrics, StandardMetrics } from './metrics';
import { VertVarSizeGlyphs, FixedSizeGlyphs } from './glyphs';
import { expect } from 'chai';
import { viewModelToPhysical } from './viewmodel-to-physical';
import { ScoreViewModel } from '../../logical-view/view-model/convert-model';
import { staffLineToY } from './functions';

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
            const element = elements[from + i];

            expect(element).to.deep.equal(
                { 
                    element: VertVarSizeGlyphs.Line,
                    position: { x: 0, y: (no - i - 1) * width },
                    length: length
                }
            );
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

        const lineWidth = 10;

        expect(physicalModel).to.deep.equal({ elements: [
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 4 * lineWidth },
                length: 10
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 3 * lineWidth },
                length: 10
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 2 * lineWidth },
                length: 10
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: lineWidth },
                length: 10
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 0 },
                length: 10
            }
        ] });

        checkStaffLines(physicalModel.elements, 0, 10, 10);
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
    });


    
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
                                    positions: [-6],
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
            position: { x: 30, y: -defaultMetrics.staffLineWidth }
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
                                    positions: [-6],
                                    noteType: NoteType.NBreve,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(2, 1), 
                            notes: [
        
                                {
                                    positions: [-6],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(3, 1), 
                            notes: [
        
                                {
                                    positions: [-6],
                                    noteType: NoteType.NHalf,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(7, 2), 
                            notes: [
        
                                {
                                    positions: [-6],
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
            position: { x: 30, y: -defaultMetrics.staffLineWidth }
        });

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 50, y: -defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 70, y: -defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 90, y: -defaultMetrics.staffLineWidth }
        });


        // stems
        expect(physicalModel.elements[8]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            length: defaultMetrics.quarterStemDefaultLength,
            position: { x: 70 + defaultMetrics.halfNoteHeadLeftXOffset, y: -defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[10]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            length: defaultMetrics.quarterStemDefaultLength,
            position: { x: 90 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.staffLineWidth }
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
            position: { x: 30, y: 3.5 * defaultMetrics.staffLineWidth }
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
                            notes: [] 
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

        const lineWidth = 10;

        expect(physicalModel.elements.length).to.eq(6);

        expect(physicalModel.elements[5]).to.deep.equal(
            { 
                element: HorizVarSizeGlyphs.Bar,
                position: { x: 50, y: 0 },
                length: 4 * lineWidth
            }
        );

    });
    
});