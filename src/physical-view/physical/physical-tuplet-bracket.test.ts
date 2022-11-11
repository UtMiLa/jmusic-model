import { Time } from './../../model/rationals/time';
import { ScoreViewModel } from './../../logical-view/view-model/score-view-model';
import { PhysicalHorizVarSizeElement, PhysicalVertVarSizeElement } from './physical-elements';
import { FlagType, NoteViewModel, BeamingViewModel, TupletViewModel } from './../../logical-view/view-model/note-view-model';
import { HorizVarSizeGlyphs, VertVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { convertNote } from './physical-note';
import { findNoteInViewModel } from './physical-beaming';
import { viewModelToPhysical } from './viewmodel-to-physical';

describe('Physical model, tuplet brackets', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            scaleDegreeUnit: 3,
            staffLengthOffset: 8,
        });
    });





    let viewModel1: ScoreViewModel;
    let viewModel2: ScoreViewModel;

    beforeEach(() => { 
        viewModel1 = { 
            staves: [
                { 
                    timeSlots: [
                        { 
                            absTime: Time.StartTime, 
                            notes: [
                                {
                                    positions: [0],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'x1'
                                } as NoteViewModel
                            ],
                            tuplets: [{
                                noteRefs: [
                                    {
                                        absTime: Time.StartTime, 
                                        uniq: 'x1'
                                    },
                                    {
                                        absTime: Time.newAbsolute(1, 6), 
                                        uniq: 'test'
                                    },
                                    {
                                        absTime: Time.newAbsolute(1, 3), 
                                        uniq: 'last'
                                    }
                                ],
                                tuplets: [
                                    { fromIdx: 0, toIndex: 2, tuplet: '3' }
                                ]
                            } as TupletViewModel]
                        },
                        { 
                            absTime: Time.newAbsolute(1, 6), 
                            notes: [                                
                                {
                                    positions: [2],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'test'
                                } as NoteViewModel
                            ] 
                        } ,
                        { 
                            absTime: Time.newAbsolute(1, 3), 
                            notes: [                                
                                {
                                    positions: [5],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'last'
                                } as NoteViewModel
                            ] 
                        }
                    ]
                }
            ]
        };
        viewModel2 = { 
            staves: [
                { 
                    timeSlots: [
                        { 
                            absTime: Time.StartTime, 
                            notes: [
                                {
                                    positions: [0],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'x1'
                                } as NoteViewModel
                            ],
                            tuplets: [{
                                noteRefs: [
                                    {
                                        absTime: Time.StartTime, 
                                        uniq: 'x1'
                                    },
                                    {
                                        absTime: Time.newAbsolute(1, 5), 
                                        uniq: 'test'
                                    },
                                    {
                                        absTime: Time.newAbsolute(2, 5), 
                                        uniq: 'mid'
                                    },
                                    {
                                        absTime: Time.newAbsolute(3, 5), 
                                        uniq: 'nxlast'
                                    },
                                    {
                                        absTime: Time.newAbsolute(4, 5), 
                                        uniq: 'last'
                                    }
                                ],
                                tuplets: [
                                    { fromIdx: 0, toIndex: 4, tuplet: '5' }
                                ]
                            } as TupletViewModel]
                        },
                        { 
                            absTime: Time.newAbsolute(1, 5), 
                            notes: [                                
                                {
                                    positions: [2],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'test'
                                } as NoteViewModel
                            ] 
                        } ,
                        { 
                            absTime: Time.newAbsolute(2, 5), 
                            notes: [                                
                                {
                                    positions: [5],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'mid'
                                } as NoteViewModel
                            ] 
                        },
                        { 
                            absTime: Time.newAbsolute(3, 5), 
                            notes: [                                
                                {
                                    positions: [3],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'nxlast'
                                } as NoteViewModel
                            ] 
                        },
                        { 
                            absTime: Time.newAbsolute(4, 5), 
                            notes: [                                
                                {
                                    positions: [2],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    tuplet: true,
                                    uniq: 'last'
                                } as NoteViewModel
                            ] 
                        }

                    ]
                }
            ]
        };
    });

    it('should display a tuplet bracket', () => {

        const physicalModel = viewModelToPhysical(viewModel1, defaultMetrics);

        expect(physicalModel.elements).to.have.length(11 + 1);

        console.log(physicalModel.elements);

        expect(physicalModel.elements[11]).to.deep.include({
            element: VertVarSizeGlyphs.TupletBracket,
            height: 5 * defaultMetrics.scaleDegreeUnit,
            text: '3'
        });

    });

    
    it('should display a quintuplet bracket', () => {

        const physicalModel = viewModelToPhysical(viewModel2, defaultMetrics);

        expect(physicalModel.elements).to.have.length(15 + 1);

        console.log(physicalModel.elements);
        
        expect(physicalModel.elements[15]).to.deep.include({
            element: VertVarSizeGlyphs.TupletBracket,
            height: 2 * defaultMetrics.scaleDegreeUnit,
            text: '5'
        });

    });

});