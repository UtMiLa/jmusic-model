import { KeyViewModel } from './../../logical-view/view-model/convert-key';
import { MeterViewModel } from './../../logical-view/view-model/convert-meter';
import { Clef } from './../../model/states/clef';
import { TimeSlotViewModel, ClefViewModel, BarType } from './../../logical-view';
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
import { ScoreViewModel } from '../../logical-view';
import { staffLineToY } from './functions';
import { getTimeSlotWidth, MeasureMap } from './measure-map';
import { FlagType } from '~/logical-view';

describe('Physical model', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            scaleDegreeUnit: 3,
            staffLengthOffset: 8,
            defaultSpacing: 30
        });
    });

    function checkStaffLines(elements: PhysicalElementBase[], from: number, width: number, length: number, no = 5): void {

        for (let i = 0; i < no; i++) {
            const element: PhysicalVertVarSizeElement = elements[from + i] as PhysicalVertVarSizeElement;

            expect(element.element).to.equal(VertVarSizeGlyphs.Line);
            expect(element.position).to.deep.equal({ x: 0, y: (no - i - 1) * width -defaultMetrics.staffTopMargin });
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

        const lineWidth = defaultMetrics.scaleDegreeUnit*2;

        expect(physicalModel).to.deep.include({ elements: [
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 4 * lineWidth -defaultMetrics.staffTopMargin },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 3 * lineWidth -defaultMetrics.staffTopMargin },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 2 * lineWidth -defaultMetrics.staffTopMargin },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: lineWidth -defaultMetrics.staffTopMargin },
                length: 0
            },
            { 
                element: VertVarSizeGlyphs.Line,
                position: { x: 0, y: 0 -defaultMetrics.staffTopMargin },
                length: 0
            }
        ] });

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 10);
    });
    
   
    it('should convert a staff position to a y value', () => {

        const lineIdxes = [-2, -1, 0, 1, 2]; // staff lines from bottom to top

        const defaultYs = lineIdxes.map(idx => staffLineToY(idx, defaultMetrics));
        const alternateYs = lineIdxes.map(idx => staffLineToY(idx, alternativeMetrics));

        expect(defaultYs).to.deep.equal([
            0, 
            defaultMetrics.scaleDegreeUnit*2, 
            defaultMetrics.scaleDegreeUnit*2*2,
            defaultMetrics.scaleDegreeUnit*2*3,
            defaultMetrics.scaleDegreeUnit*2*4
        ]);  
        expect(alternateYs).to.deep.equal([
            0, 
            alternativeMetrics.scaleDegreeUnit*2, 
            alternativeMetrics.scaleDegreeUnit*2*2,
            alternativeMetrics.scaleDegreeUnit*2*3,
            alternativeMetrics.scaleDegreeUnit*2*4
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
            scaleDegreeUnit*2: 50,
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

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 30);

        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'clefs.G',
            position: { x: 10, y: defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
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
                                clefType: ClefType.C,
                                line: -3
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

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 50);

        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'clefs.C',
            position: { x: 10, y: defaultMetrics.scaleDegreeUnit*1 -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 30, y: -0.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
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

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 110);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 30, y: -0.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 50, y: -0.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 70, y: -0.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 90, y: -0.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });


        // stems
        expect(physicalModel.elements[8]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            height: defaultMetrics.quarterStemDefaultLength,
            position: { x: 70 + defaultMetrics.halfNoteHeadLeftXOffset, y: -0.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[10]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            height: defaultMetrics.quarterStemDefaultLength,
            position: { x: 90 + defaultMetrics.blackNoteHeadLeftXOffset, y: -0.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });

    });
   
    it('should convert note values with a beam', () => {
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
                            beamings: [{
                                beams: [{ fromIdx: 0, toIndex: 1, level: 0 }],
                                noteRefs: [
                                    {absTime: Time.newAbsolute(0, 1), uniq: '0-0-0'},
                                    {absTime: Time.newAbsolute(1, 8), uniq: '0-0-1'}
                                ]
                            }],
                            notes: [
                                {
                                    positions: [-5],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    flagType: FlagType.Beam,
                                    uniq: '0-0-0'
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(1, 8), 
                            notes: [
        
                                {
                                    positions: [-4],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    flagType: FlagType.Beam,
                                    uniq: '0-0-1'
                                },
                            ]
                        }                       
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 5);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 110);

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 30, y: -defaultMetrics.scaleDegreeUnit -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 50, y: -defaultMetrics.staffTopMargin  }
        });
        expect(physicalModel.elements[10]).to.deep.eq({
            element: VertVarSizeGlyphs.Beam,
            height: defaultMetrics.scaleDegreeUnit,
            length: 20,
            position: { x: 30 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.scaleDegreeUnit + defaultMetrics.quarterStemDefaultLength -defaultMetrics.staffTopMargin }
        });

        // stems
        expect(physicalModel.elements[6]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            height: defaultMetrics.quarterStemDefaultLength,
            position: { x: 30 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.scaleDegreeUnit -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[8]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            height: defaultMetrics.quarterStemDefaultLength,
            position: { x: 50 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.staffTopMargin }
        });

    });
   
    it('should convert note values with two simultaneous beams', () => {
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
                            beamings: [{
                                beams: [{ fromIdx: 0, toIndex: 1, level: 0 }],
                                noteRefs: [
                                    {absTime: Time.newAbsolute(0, 1), uniq: '0-0-0'},
                                    {absTime: Time.newAbsolute(1, 8), uniq: '0-0-1'}
                                ]
                            },
                            {
                                beams: [{ fromIdx: 0, toIndex: 2, level: 0 }, { fromIdx: 0, toIndex: 1, level: 1 }],
                                noteRefs: [
                                    {absTime: Time.newAbsolute(0, 1), uniq: '0-1-0'},
                                    {absTime: Time.newAbsolute(1, 16), uniq: '0-1-1'},
                                    {absTime: Time.newAbsolute(1, 8), uniq: '0-1-2'}
                                ]
                            }],
                            notes: [
                                {
                                    positions: [-5],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    flagType: FlagType.Beam,
                                    uniq: '0-0-0'
                                },
                                {
                                    positions: [5],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    flagType: FlagType.Beam,
                                    uniq: '0-1-0'
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(1, 16), 
                            notes: [
        
                                {
                                    positions: [4],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    flagType: FlagType.Beam,
                                    uniq: '0-1-1'
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(1, 8), 
                            notes: [
        
                                {
                                    positions: [-4],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    flagType: FlagType.Beam,
                                    uniq: '0-0-1'
                                },
                                {
                                    positions: [4],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    flagType: FlagType.Beam,
                                    uniq: '0-1-2'
                                },
                            ]
                        }                       
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 5 + 6 + 2);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 110);

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 30, y: -defaultMetrics.scaleDegreeUnit -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[13]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 70, y: -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[14]).to.deep.eq({
            element: VertVarSizeGlyphs.Beam,
            height: defaultMetrics.scaleDegreeUnit,
            length: 40,
            position: { x: 30 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.scaleDegreeUnit + defaultMetrics.quarterStemDefaultLength -defaultMetrics.staffTopMargin }
        });

        // voice 2
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 30, y: 9*defaultMetrics.scaleDegreeUnit -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 50, y: 8*defaultMetrics.scaleDegreeUnit -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[16]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 70, y: 8*defaultMetrics.scaleDegreeUnit -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[17]).to.deep.eq({
            element: VertVarSizeGlyphs.Beam,
            height: -defaultMetrics.scaleDegreeUnit,
            length: 40,
            position: { x: 30 + defaultMetrics.blackNoteHeadLeftXOffset, y: 9*defaultMetrics.scaleDegreeUnit + defaultMetrics.quarterStemDefaultLength -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[18]).to.deep.eq({
            element: VertVarSizeGlyphs.Beam,
            height: -0.5*defaultMetrics.scaleDegreeUnit,
            length: 20,
            position: { x: 30 + defaultMetrics.blackNoteHeadLeftXOffset, y: 9*defaultMetrics.scaleDegreeUnit - defaultMetrics.beamSpacing + defaultMetrics.quarterStemDefaultLength -defaultMetrics.staffTopMargin }
        });

        //console.log(physicalModel.elements);
        
        // stems
        expect(physicalModel.elements[6]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            height: defaultMetrics.quarterStemDefaultLength,
            position: { x: 30 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.scaleDegreeUnit -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[12]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            height: defaultMetrics.quarterStemDefaultLength,
            position: { x: 70 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.staffTopMargin }
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

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 110);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 30, y: 2*defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 50, y: 1.5*defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 70, y: defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 90, y: 0.5*defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
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
                                alteration: 1,
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
            position: { x: 50, y: 1.5*defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
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
                                clefType: ClefType.F,
                                line: 2
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

        checkStaffLines(physicalModel.elements, 0, alternativeMetrics.scaleDegreeUnit*2, 158);
        
        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'clefs.F',
            position: { x: 10, y: alternativeMetrics.scaleDegreeUnit*6 - alternativeMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 10 + alternativeMetrics.defaultSpacing, y: 2*alternativeMetrics.scaleDegreeUnit*2 - alternativeMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 10 + alternativeMetrics.defaultSpacing*2, y: 1.5*alternativeMetrics.scaleDegreeUnit*2 - alternativeMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 10 + alternativeMetrics.defaultSpacing*3, y: alternativeMetrics.scaleDegreeUnit*2 - alternativeMetrics.staffTopMargin }
        });
        expect(physicalModel.elements[11]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 10 + alternativeMetrics.defaultSpacing*4, y: 0.5*alternativeMetrics.scaleDegreeUnit*2 - alternativeMetrics.staffTopMargin }
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
                                keyPositions: [{ alteration: -1, position: 3}]
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
            position: { x: 10, y: 3.5 * defaultMetrics.scaleDegreeUnit*2 -defaultMetrics.staffTopMargin }
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

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.scaleDegreeUnit*2, 30);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'five',
            position: { x: 30, y: 2 * defaultMetrics.scaleDegreeUnit*2 + defaultMetrics.meterAdjustY -defaultMetrics.staffTopMargin }
        });

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'four',
            position: { x: 30, y: defaultMetrics.meterAdjustY -defaultMetrics.staffTopMargin }
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
                                keyPositions: [{ alteration: -1, position: 3}, { alteration: -1, position: 6}]
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
            position: { 
                x: 30 + 2 * defaultMetrics.keySigSpacing + defaultMetrics.defaultSpacing, 
                y: 2 * defaultMetrics.scaleDegreeUnit*2 + defaultMetrics.meterAdjustY -defaultMetrics.staffTopMargin
            }
        });

        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'four',
            position: { 
                x: 30 + 2 * defaultMetrics.keySigSpacing + defaultMetrics.defaultSpacing, 
                y: defaultMetrics.meterAdjustY -defaultMetrics.staffTopMargin
            }
        });
    });
   
    
    it('should render clef changes in a smaller size', () => {
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
                                    positions: [-1],
                                    noteType: NoteType.NWhole,
                                    direction: NoteDirection.Up
                                },
                            ]
                        },
                        { 
                            absTime: Time.newAbsolute(1, 1), 
                            clef:    { 
                                position: 1,
                                clefType: ClefType.F,
                                change: true,
                                line: 2
                            },        
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

        expect(physicalModel.elements[5]).to.deep.include({
            glyph: 'clefs.F'
        });

        expect(physicalModel.elements[7]).to.deep.include({
            glyph: 'clefs.F_change'
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
                            bar: { barType: BarType.Simple },
                            notes: [] 
                        } 
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        const lineWidth = defaultMetrics.scaleDegreeUnit*2;

        expect(physicalModel.elements.length).to.eq(7);

        expect(physicalModel.elements[6]).to.deep.equal(
            { 
                element: HorizVarSizeGlyphs.Bar,
                position: { x: 30, y: -defaultMetrics.staffTopMargin },
                height: 4 * lineWidth
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
                                { position: -6, direction: NoteDirection.Down, toTime: Time.newAbsolute(1, 0) },
                                { position: -4, direction: NoteDirection.Up, toTime: Time.newAbsolute(1, 0) }
                            ],
                            notes: [{
                                positions: [0],
                                noteType: NoteType.NWhole,
                                direction: NoteDirection.Up
                            },] 
                        } ,
                        { 
                            absTime: Time.newAbsolute(1, 1), 
                            notes: [{
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

        expect(physicalModel.elements.length).to.eq(9);

        expect(physicalModel.elements[6]).to.deep.equal(
            { 
                element: VertVarSizeGlyphs.Tie,
                position: { x: 10 + defaultMetrics.tieAfterNote, y: -defaultMetrics.scaleDegreeUnit*2 - defaultMetrics.staffTopMargin },
                direction: NoteDirection.Down,
                length: 12
            }
        );

        expect(physicalModel.elements[7]).to.deep.equal(

            { 
                element: VertVarSizeGlyphs.Tie,
                position: { x: 10 + defaultMetrics.tieAfterNote, y: -defaultMetrics.staffTopMargin },
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
                key: { keyPositions: [{ alteration: -1, position: 1 }] } as KeyViewModel,
                notes: []
            };
            const res = getTimeSlotWidth(timeSlot1, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing + 1 * defaultMetrics.keySigSpacing);

            const timeSlot2: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                key: { keyPositions: [
                    { alteration: 1, position: 1 },
                    { alteration: 1, position: 2 },
                    { alteration: 1, position: 3 },
                    { alteration: 1, position: 4 },
                    { alteration: 1, position: 5 },
                    { alteration: 1, position: 6 },
                    { alteration: 1, position: 7 }
                ] } as KeyViewModel,
                notes: []
            };
            const res2 = getTimeSlotWidth(timeSlot2, defaultMetrics);

            expect(res2).to.eq(defaultMetrics.defaultSpacing + 7 * defaultMetrics.keySigSpacing);

        });

        it('should calculate the width of a bar', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                bar: { barType: BarType.Simple },
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
                accidentals: [{position: 1, alteration: -1, displacement: 0}],
                notes: [{noteType: NoteType.NWhole, positions: [1], direction: NoteDirection.Undefined }]
            };
            const res = getTimeSlotWidth(timeSlot, defaultMetrics);

            expect(res).to.eq(defaultMetrics.defaultSpacing + defaultMetrics.accidentalSpacing);
        });        

        
        
        it('should calculate the width of the whole timeslot', () => {
            const timeSlot: TimeSlotViewModel = {
                absTime: Time.newAbsolute(1,1),
                clef: { clefType: ClefType.G, line: 2 } as ClefViewModel,
                bar: { barType: BarType.Simple },
                key: { keyPositions: [{ alteration: -1, position: 1 }] } as KeyViewModel,
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
                accidentals: [{ alteration: -1, position: 1, displacement: 0 }],
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