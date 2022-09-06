import { NoteType, NoteDirection } from './../notes/note';
import { ClefType } from '~/states/clef';
import { PhysicalElementBase } from './physical-elements';
import { Metrics, StandardMetrics } from './metrics';
import { ScoreViewModel } from '../score/score';
import { VertVarSizeGlyphs, FixedSizeGlyphs } from './glyphs';
import { StaffViewModel } from '../score/staff';
import { expect } from 'chai';
import { viewModelToPhysical } from './viewmodel-to-physical';
describe('Physical model', () => {
    let defaultMetrics: Metrics;
    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
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
                { objects: [] } 
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
    
   
    it('should size staff lines from settings', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                { objects: [] } 
            ]
        };

        const settings = {
            staffLineWidth: 50,
            staffLengthOffset: 30
        };

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
                    objects: [                
                        { 
                            position: 1,
                            clefType: ClefType.G,
                            line: -2
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, defaultMetrics.staffLengthOffset);

        expect(physicalModel.elements[5]).to.deep.eq({
            glyph: 'clefs.G',
            position: { x: 10, y: defaultMetrics.staffLineWidth }
        });
    });
    
    it('should convert a view model with a staff with a clef and one note', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
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
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 2);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, defaultMetrics.staffLengthOffset);

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
                    objects: [                
                        { 
                            position: 1,
                            clefType: ClefType.G,
                            line: -2
                        },
                        {
                            positions: [-6],
                            noteType: NoteType.NBreve,
                            direction: NoteDirection.Up
                        },
                        {
                            positions: [-6],
                            noteType: NoteType.NWhole,
                            direction: NoteDirection.Up
                        },
                        {
                            positions: [-6],
                            noteType: NoteType.NHalf,
                            direction: NoteDirection.Up
                        },
                        {
                            positions: [-6],
                            noteType: NoteType.NQuarter,
                            direction: NoteDirection.Up
                        }
                    ]
                }
            ]
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 4);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, defaultMetrics.staffLengthOffset);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 30, y: -defaultMetrics.staffLineWidth }
        });

        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 50, y: -defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[8]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 70, y: -defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 90, y: -defaultMetrics.staffLineWidth }
        });
    });
   
    
    it('should convert note pitches correctly', () => {
        const viewModel: ScoreViewModel = { 
            staves: [
                {
                    objects: [                
                        { 
                            position: 1,
                            clefType: ClefType.G,
                            line: -2
                        },
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
        };

        const physicalModel = viewModelToPhysical(viewModel, defaultMetrics);

        expect(physicalModel.elements.length).to.eq(5 + 1 + 4);

        checkStaffLines(physicalModel.elements, 0, defaultMetrics.staffLineWidth, defaultMetrics.staffLengthOffset);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.sM1',
            position: { x: 30, y: 2*defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[7]).to.deep.eq({
            glyph: 'noteheads.s0',
            position: { x: 50, y: 1.5*defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[8]).to.deep.eq({
            glyph: 'noteheads.s1',
            position: { x: 70, y: defaultMetrics.staffLineWidth }
        });
        expect(physicalModel.elements[9]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 90, y: 0.5*defaultMetrics.staffLineWidth }
        });
    });
   
});