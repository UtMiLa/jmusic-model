import { BeamingViewModel } from './../../logical-view/view-model/note-view-model';
import { Time } from './../../model/rationals/time';
import { ScoreViewModel } from './../../logical-view/view-model/score-view-model';
import { NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { HorizVarSizeGlyphs, VertVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { viewModelToPhysical } from './viewmodel-to-physical';
import { findNoteInViewModel, PhysicalBeamGroup } from './physical-beaming';

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
                                    { fromIdx: 0, toIndex: 1, level: 0 }
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
                { fromIdx: 0, toIndex: 2, level: 0 },
                { fromIdx: 0, toIndex: 1, level: 1 }
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
        expect(output[1].position.y).to.eq(notestem1.position.y + notestem1.height - defaultMetrics.beamSpacing);
        expect(output[1].length).to.eq(notestem2.position.x - notestem1.position.x);
        expect(output[1].height).to.eq((notestem3.position.y - notestem1.position.y) * (90-70)/(110-70) );

        expect(notestem2.height).to.eq(24 - 3);
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
                { fromIdx: 0, toIndex: 2, level: 0 },
                { fromIdx: 1, toIndex: 2, level: 1 }
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
            + defaultMetrics.beamSpacing // + beam vert spacing
        );
        expect(output[1].length, 'output[1].length').to.eq(notestem3.position.x - notestem2.position.x);
        expect(output[1].height, 'output[1].height').to.eq((notestem3.position.y - notestem1.position.y) * (90-70)/(110-70) );

    });


    //it('should adjust stem lengths to touch beam');

    it('should render a broken secondary beam', () => {
        const beaming = {
            noteRefs: [
                {
                    absTime: Time.newAbsolute(0, 1), 
                    uniq: '16_1'
                },
                {
                    absTime: Time.newAbsolute(1, 16), 
                    uniq: '8'
                },
                {
                    absTime: Time.newAbsolute(3, 16), 
                    uniq: '16_2'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 2, level: 0 },
                { fromIdx: 0, toIndex: undefined, level: 1 },
                { fromIdx: undefined, toIndex: 2, level: 1 }
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
            uniq: '8',
            absTime: Time.newAbsolute(1, 16)  
        }, notestem2, output)).to.be.false;

        expect(output).to.have.length(0);

        expect(physBM.addNote({
            uniq: '16_2',
            absTime: Time.newAbsolute(3, 16)  
        }, notestem3, output)).to.be.true;

        expect(output).to.have.length(3);
        
        expect(output[0].element).to.eq(VertVarSizeGlyphs.Beam);
        expect(output[0].position.x).to.eq(notestem1.position.x);
        expect(output[0].position.y).to.eq(notestem1.position.y + notestem1.height);
        expect(output[0].length).to.eq(notestem3.position.x - notestem1.position.x);
        expect(output[0].height).to.eq(notestem3.position.y - notestem1.position.y);

        expect(output[1].element).to.eq(VertVarSizeGlyphs.Beam);
        expect(output[1].position.x).to.eq(notestem1.position.x);
        expect(output[1].position.y).to.eq(notestem1.position.y + notestem1.height - defaultMetrics.beamSpacing);
        expect(output[1].length).to.eq(defaultMetrics.brokenBeamLength);
        expect(output[1].height).to.eq(defaultMetrics.brokenBeamLength * (6 * defaultMetrics.scaleDegreeUnit)/(110-70) );

        expect(notestem2.height).to.eq(24 - defaultMetrics.scaleDegreeUnit);
    });


        
    it('should prolong stems for 16th notes and smaller', () => {
        const beaming = {
            noteRefs: [
                {
                    absTime: Time.newAbsolute(0, 1), 
                    uniq: '8'
                },
                {
                    absTime: Time.newAbsolute(1, 8), 
                    uniq: '32_1'
                },
                {
                    absTime: Time.newAbsolute(5, 32), 
                    uniq: '32_2'
                },
                {
                    absTime: Time.newAbsolute(3, 16), 
                    uniq: '16'
                }
            ],
            beams: [
                { fromIdx: 0, toIndex: 3, level: 0 },
                { fromIdx: 1, toIndex: 3, level: 1 },
                { fromIdx: 1, toIndex: 2, level: 2 }
            ]
        };
        const physBM = new PhysicalBeamGroup(beaming as BeamingViewModel, defaultMetrics);

        const notestem1 = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 70, y: -1 * 6 } };
        const notestem2 = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 90, y: 1 * 6 } };
        const notestem3 = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 110, y: 2 * 6 } };
        const notestem4 = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 130, y: 2 * 6 } };

        const notestem1clone = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 70, y: -1 * 6 } };
        const notestem2clone = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 90, y: 1 * 6 } };
        const notestem3clone = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 110, y: 2 * 6 } };
        const notestem4clone = { element: HorizVarSizeGlyphs.Stem, height: -24, position: { x: 130, y: 2 * 6 } };

        const output: any[] = [];
   
        expect(physBM.addNote({
            uniq: '8',
            absTime: Time.newAbsolute(0, 1)
        }, notestem1clone, output)).to.be.false;

        expect(physBM.addNote({
            uniq: '32_1',
            absTime: Time.newAbsolute(1, 8)
        }, notestem2clone, output)).to.be.false;

        expect(physBM.addNote({
            uniq: '32_2',
            absTime: Time.newAbsolute(5, 32)
        }, notestem2clone, output)).to.be.false;

        expect(output).to.have.length(0);

        expect(physBM.addNote({
            uniq: '16',
            absTime: Time.newAbsolute(3, 16)  
        }, notestem4clone, output)).to.be.true;

        expect(output).to.have.length(3);

        expect(physBM.calcSlope()).to.eq(3 * 6 / 60);

        expect(notestem1.height).to.eq(notestem1clone.height + defaultMetrics.beamSpacing);
        
    });

/*

    Når der kommer en BeamGrpVM, oprettes en physBeamGrp, som pushes i en lokal stak.
    Når der kommer en node med beaming, fremsøges den tilhørende physBeamGrp i stakken og opdateres med den pågældende node.
    Når alle noder [i en beamgrp] er udført, beregnes længder af beams og stems. Stem-objekter får justeret længden; Beam-elementer tilføjes til output.

*/
});