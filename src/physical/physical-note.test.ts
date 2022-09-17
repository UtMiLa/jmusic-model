import { HorizVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from './../notes/note';
import { ClefType } from '~/states/clef';
import { PhysicalElementBase } from './physical-elements';
import { Metrics, StandardMetrics } from './metrics';
import { VertVarSizeGlyphs, FixedSizeGlyphs } from './glyphs';
import { expect } from 'chai';
import { viewModelToPhysical } from './viewmodel-to-physical';
import { ScoreViewModel } from '../view-model/convert-model';
import { staffLineToY } from './functions';
import { convertNote } from './physical-note';

describe('Physical model', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            staffLineWidth: 6,
            staffLengthOffset: 8,
        });
    });


    it('should attach stem on note on up/down direction', () => {
        //
        const note =                         {
            positions: [3],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Down
        };

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(2);

        expect(physical[0]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            position: { x: 20, y: 3.5*defaultMetrics.staffLineWidth },
            length: -25
        });

        expect(physical[1]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 20, y: 3.5*defaultMetrics.staffLineWidth }
        });

    });
   
});