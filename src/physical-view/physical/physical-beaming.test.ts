import { BeamingViewModel } from './../../logical-view/view-model/beaming-view-model';
import { Time } from './../../model/rationals/time';
import { ScoreViewModel } from './../../logical-view/view-model/convert-model';
import { PhysicalHorizVarSizeElement, PhysicalVertVarSizeElement } from './physical-elements';
import { FlagType, NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { HorizVarSizeGlyphs, VertVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { convertNote } from './physical-note';
import { viewModelToPhysical } from './viewmodel-to-physical';
import { findNoteInViewModel, PhysicalBeamGroup } from './physical-beaming';
import exp = require('constants');

describe('Physical model, note beaming', () => {
    let defaultMetrics: Metrics;
    let viewModel1: ScoreViewModel;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        viewModel1 = { 
            staves: [
                { 
                    timeSlots: [
                        { 
                            absTime: Time.newAbsolute(0, 1), 
                            notes: [
                                {
                                    positions: [0],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    uniq: 'x1'
                                } as NoteViewModel
                            ],
                            beamings: [{
                                noteRefs: [
                                    {
                                        absTime: Time.newAbsolute(0, 1), 
                                        uniq: 'x1'
                                    },
                                    {
                                        absTime: Time.newAbsolute(1, 8), 
                                        uniq: 'test'
                                    }
                                ],
                                beams: [
                                    { fromIdx: 0, toIndex: 1 }
                                ]
                            } as BeamingViewModel]
                        },
                        { 
                            absTime: Time.newAbsolute(1, 8), 
                            notes: [                                
                                {
                                    positions: [2],
                                    noteType: NoteType.NQuarter,
                                    direction: NoteDirection.Up,
                                    uniq: 'test'
                                } as NoteViewModel
                            ] 
                        } 
                    ]
                }
            ]
        };
    });


    it('should render a beam between two eighth notes', () => {

        const note1 = findNoteInViewModel(((viewModel1.staves[0].timeSlots[0].beamings as BeamingViewModel[])[0]).noteRefs[0], viewModel1);
        const note2 = findNoteInViewModel(((viewModel1.staves[0].timeSlots[0].beamings as BeamingViewModel[])[0]).noteRefs[1], viewModel1);

        expect(note1, 'note1').to.exist;
        expect(note2, 'note2').to.exist;

        expect((note1 as any).uniq, 'note1').to.eq('x1');
        expect((note2 as any).uniq, 'note2').to.eq('test');

        const physicalModel = viewModelToPhysical(viewModel1, defaultMetrics);

        expect(physicalModel.elements[6]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: defaultMetrics.staffLengthOffset, y: 4 * defaultMetrics.scaleDegreeUnit }
        });

        expect(physicalModel.elements[8]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: defaultMetrics.staffLengthOffset + defaultMetrics.defaultSpacing, y: 6 * defaultMetrics.scaleDegreeUnit }
        });

        //  { "element": VertVarSizeGlyphs.Beam, "length": 70, "height": 10, "position": { "x": 70+7, "y": 3 * lineWidth } },

    });

    it('should create a physical beam object from a logical', () => {
        const physBM = new PhysicalBeamGroup((viewModel1.staves[0].timeSlots[0].beamings as BeamingViewModel[])[0], defaultMetrics);

        expect(physBM).to.exist;
    });

    it('should identify whether a note belongs to the physical beam object', () => {
        const physBM = new PhysicalBeamGroup((viewModel1.staves[0].timeSlots[0].beamings as BeamingViewModel[])[0], defaultMetrics);
   
        expect(physBM.testNote({
            uniq: 'nonexist',
            absTime: Time.newAbsolute(1, 0)  
        })).to.be.false;
        expect(physBM.testNote({
            uniq: 'test',
            absTime: Time.newAbsolute(1, 8)  
        })).to.be.true;
        
    });

    it('should collect notes in beam group and output beam when full', () => {
        const physBM = new PhysicalBeamGroup((viewModel1.staves[0].timeSlots[0].beamings as BeamingViewModel[])[0], defaultMetrics);

        const notestem1 = { element: HorizVarSizeGlyphs.Stem, height: 24, position: { x: 70+7, y: -1 * 6 } };
        const notestem2 = { element: HorizVarSizeGlyphs.Stem, height: 22, position: { x: 140+7, y: 1 * 6 } };

        const output: any[] = [];
   
        expect(physBM.addNote({
            uniq: 'x1',
            absTime: Time.newAbsolute(0, 8)
        }, notestem1, output)).to.be.false;

        expect(output).to.have.length(0);

        expect(physBM.addNote({
            uniq: 'test',
            absTime: Time.newAbsolute(1, 8)  
        }, notestem2, output)).to.be.true;
        
        expect(output).to.have.length(1);

        expect(physBM.getNotestem(0)).to.eq(notestem1);

        expect(output[0].element).to.eq(VertVarSizeGlyphs.Beam);
        expect(output[0].position.x).to.eq(notestem1.position.x);
        expect(output[0].position.y).to.eq(notestem1.position.y + notestem1.height);
        expect(output[0].length).to.eq(notestem2.position.x - notestem1.position.x);
        expect(output[0].height).to.eq(notestem2.position.y - notestem1.position.y);

    });




    it('should output correct beams for a 1/8 1/8 1/4 group', () => {
        const beaming = {
            noteRefs: [
                {
                    absTime: Time.newAbsolute(0, 1), 
                    uniq: '16_1'
                },
                {
                    absTime: Time.newAbsolute(1, 16), 
                    uniq: '16_2'
                },
                {
                    absTime: Time.newAbsolute(1, 8), 
                    uniq: '8'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 2 },
                { fromIdx: 0, toIndex: 1 }
            ]
        };
        const physBM = new PhysicalBeamGroup(beaming as BeamingViewModel, defaultMetrics);

        const notestem1 = { element: HorizVarSizeGlyphs.Stem, height: 24, position: { x: 70+7, y: -1 * 6 } };
        const notestem2 = { element: HorizVarSizeGlyphs.Stem, height: 24, position: { x: 90+7, y: 1 * 6 } };
        const notestem3 = { element: HorizVarSizeGlyphs.Stem, height: 24, position: { x: 110+7, y: 2 * 6 } };

        const output: any[] = [];
   
        expect(physBM.addNote({
            uniq: '16_1',
            absTime: Time.newAbsolute(0, 1)
        }, notestem1, output)).to.be.false;

        expect(physBM.addNote({
            uniq: '16_2',
            absTime: Time.newAbsolute(1, 16)  
        }, notestem2, output)).to.be.false;

        expect(output).to.have.length(0);

        expect(physBM.addNote({
            uniq: '8',
            absTime: Time.newAbsolute(1, 8)  
        }, notestem3, output)).to.be.true;

        expect(output).to.have.length(2);
        
        expect(output[0].element).to.eq(VertVarSizeGlyphs.Beam);
        expect(output[0].position.x).to.eq(notestem1.position.x);
        expect(output[0].position.y).to.eq(notestem1.position.y + notestem1.height);
        expect(output[0].length).to.eq(notestem3.position.x - notestem1.position.x);
        expect(output[0].height).to.eq(notestem3.position.y - notestem1.position.y);

        expect(output[1].element).to.eq(VertVarSizeGlyphs.Beam);
        expect(output[1].position.x).to.eq(notestem1.position.x);
        expect(output[1].position.y).to.eq(notestem1.position.y + notestem1.height - 6);
        expect(output[1].length).to.eq(notestem2.position.x - notestem1.position.x);
        expect(output[1].height).to.eq((notestem3.position.y - notestem1.position.y) * (90-70)/(110-70) );

    });

    
    it('should output correct beams for a 1/4 1/8 1/8 group with downward stems', () => {
        const beaming = {
            noteRefs: [
                {
                    absTime: Time.newAbsolute(0, 1), 
                    uniq: '8'
                },
                {
                    absTime: Time.newAbsolute(1, 8), 
                    uniq: '16_1'
                },
                {
                    absTime: Time.newAbsolute(3, 16), 
                    uniq: '16_2'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 2 },
                { fromIdx: 1, toIndex: 2 }
            ]
        };
        const physBM = new PhysicalBeamGroup(beaming as BeamingViewModel, defaultMetrics);

        const notestem1 = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 70, y: -1 * 6 } };
        const notestem2 = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 90, y: 1 * 6 } };
        const notestem3 = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 110, y: 2 * 6 } };

        const notestem1clone = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 70, y: -1 * 6 } };
        const notestem2clone = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 90, y: 1 * 6 } };
        const notestem3clone = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 110, y: 2 * 6 } };

        const output: any[] = [];
   
        expect(physBM.addNote({
            uniq: '8',
            absTime: Time.newAbsolute(0, 1)
        }, notestem1clone, output)).to.be.false;

        expect(physBM.addNote({
            uniq: '16_1',
            absTime: Time.newAbsolute(1, 8)
        }, notestem2clone, output)).to.be.false;

        expect(output).to.have.length(0);

        expect(physBM.addNote({
            uniq: '16_2',
            absTime: Time.newAbsolute(3, 16)  
        }, notestem3clone, output)).to.be.true;

        expect(output).to.have.length(2);

        expect(physBM.calcSlope()).to.eq(3 * 6 / 40);
        
        expect(output[0].element).to.eq(VertVarSizeGlyphs.Beam);
        expect(output[0].position.x).to.eq(notestem1.position.x);
        expect(output[0].position.y).to.eq(notestem1.position.y + notestem1.height);
        expect(output[0].length).to.eq(notestem3.position.x - notestem1.position.x);
        expect(output[0].height).to.eq(notestem3.position.y - notestem1.position.y);

        expect(output[1].element, 'output[1].element').to.eq(VertVarSizeGlyphs.Beam);
        expect(output[1].position.x, 'output[1].position.x').to.eq(notestem2.position.x);
        expect(output[1].position.y, 'output[1].position.y').to.eq(
            (notestem1.position.y + notestem1.height + notestem3.position.y + notestem3.height)/2 // midpoint
            + 2*defaultMetrics.scaleDegreeUnit // + beam vert spacing
        );
        expect(output[1].length, 'output[1].length').to.eq(notestem3.position.x - notestem2.position.x);
        expect(output[1].height, 'output[1].height').to.eq((notestem3.position.y - notestem1.position.y) * (90-70)/(110-70) );

    });



/*

    Når der kommer en BeamGrpVM, oprettes en physBeamGrp, som pushes i en lokal stak.
    Når der kommer en node med beaming, fremsøges den tilhørende physBeamGrp i stakken og opdateres med den pågældende node.
    Når alle noder [i en beamgrp] er udført, beregnes længder af beams og stems. Stem-objekter får justeret længden; Beam-elementer tilføjes til output.

*/
});