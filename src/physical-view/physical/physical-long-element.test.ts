import { LongDecorationViewModel as LongDecorationViewModel } from './../../logical-view/view-model/convert-decoration';
import { Time } from './../../model/rationals/time';
import { ScoreViewModel } from './../../logical-view/view-model/score-view-model';
import { NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { VertVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { viewModelToPhysical } from './viewmodel-to-physical';
import { LongDecorationType } from '~/model';

describe('Physical model, long expressions', () => {
    let defaultMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
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
                            decorations: [{
                                noteRefs: [
                                    {
                                        absTime: Time.StartTime, 
                                        uniq: 'x1'
                                    },
                                    {
                                        absTime: Time.newAbsolute(1, 3), 
                                        uniq: 'last'
                                    }
                                ],
                                type: LongDecorationType.Crescendo
                            } as LongDecorationViewModel]
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
       
    });




    it('should get the coordinates of a hairpin crescendo', () => {
        const physicalModel = viewModelToPhysical(viewModel1, defaultMetrics);

        expect(physicalModel.elements).to.have.length(11 + 1);

        //console.log(physicalModel.elements);

        expect(physicalModel.elements[11]).to.deep.include({
            element: VertVarSizeGlyphs.Crescendo,
            position: { x: defaultMetrics.staffLengthOffset + defaultMetrics.blackNoteHeadLeftXOffset, y: defaultMetrics.dynamicY - defaultMetrics.staffTopMargin },
            height: 0,
            length: defaultMetrics.defaultSpacing * 2
        });

        (viewModel1.staves[0].timeSlots[0] as any).decorations[0].type = LongDecorationType.Decrescendo;

        const physicalModel2 = viewModelToPhysical(viewModel1, defaultMetrics);

        expect(physicalModel2.elements).to.have.length(11 + 1);

        //console.log(physicalModel.elements);

        expect(physicalModel2.elements[11]).to.deep.include({
            element: VertVarSizeGlyphs.Decrescendo,
            position: { x: defaultMetrics.staffLengthOffset + defaultMetrics.blackNoteHeadLeftXOffset, y: defaultMetrics.dynamicY - defaultMetrics.staffTopMargin },
            height: 0,
        });

    });

    

    it('should get the coordinates of a slur', () => {
        (viewModel1.staves[0].timeSlots[0] as any).decorations[0].type = LongDecorationType.Slur;

        const physicalModel = viewModelToPhysical(viewModel1, defaultMetrics);

        expect(physicalModel.elements).to.have.length(11 + 1);

        //console.log(physicalModel.elements);

        expect(physicalModel.elements[11]).to.deep.include({
            element: VertVarSizeGlyphs.SlurOver,
            position: { x: defaultMetrics.staffLengthOffset + defaultMetrics.blackNoteHeadLeftXOffset, y: - defaultMetrics.staffTopMargin + 4 * defaultMetrics.scaleDegreeUnit },
            height: 5 * defaultMetrics.scaleDegreeUnit,
            length: defaultMetrics.defaultSpacing * 2
        });

    });


});