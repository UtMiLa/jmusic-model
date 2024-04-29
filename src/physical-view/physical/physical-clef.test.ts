import { KeyViewModel } from './../../logical-view/view-model/convert-key';
import { MeterViewModel } from './../../logical-view/view-model/convert-meter';
import { Clef } from './../../model/states/clef';
import { TimeSlotViewModel, ClefViewModel, BarType } from './../../logical-view';
import { TimeSlot } from './../../model/score/sequence';
import { Accidental } from './../../model/pitches/pitch';
import { Time } from './../../model/rationals/time';
import { HorizVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model';
import { ClefType } from '../../model';
import { PhysicalElementBase, PhysicalVertVarSizeElement, getPhysicalRect } from './physical-elements';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { clefTranspositionGlyphs, viewModelToPhysical } from './viewmodel-to-physical';
import { ScoreViewModel } from '../../logical-view';
import { staffLineToY } from './functions';
import { getTimeSlotWidth, MeasureMap } from './measure-map';
import { FlagType } from '../../logical-view';

describe('Physical model clef', () => {
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



    it('should convert an untransposed clef correctly', () => {
        const physicalModel = clefTranspositionGlyphs(0, 10, defaultMetrics, 0);

        expect(physicalModel).to.have.length(0);
    });


    it('should convert a transposed clef correctly', () => {
        const physicalModelM7 = clefTranspositionGlyphs(-7, 10, defaultMetrics, 0);

        expect(physicalModelM7).to.have.length(1);
        expect(physicalModelM7[0]).to.deep.include({ glyph: 'eight', scale: 0.6 });
        expect(physicalModelM7[0].position.y).to.eq(-6);
        
        const physicalModelM15 = clefTranspositionGlyphs(-14, 10, defaultMetrics, 0);

        expect(physicalModelM15).to.have.length(2);
        expect(physicalModelM15[0]).to.deep.include({ glyph: 'one', scale: 0.6 });
        expect(physicalModelM15[1]).to.deep.include({ glyph: 'five', scale: 0.6 });
        expect(physicalModelM15[0].position.y).to.eq(-6);
        
        const physicalModel7 = clefTranspositionGlyphs(7, 10, defaultMetrics, 0);

        expect(physicalModel7).to.have.length(1);
        expect(physicalModel7[0]).to.deep.include({ glyph: 'eight', scale: 0.6 });
        expect(physicalModel7[0].position.y).to.eq(30);

        const physicalModel15 = clefTranspositionGlyphs(14, 10, defaultMetrics, 0);

        expect(physicalModel15).to.have.length(2);
        expect(physicalModel15[0]).to.deep.include({ glyph: 'one', scale: 0.6 });
        expect(physicalModel15[1]).to.deep.include({ glyph: 'five', scale: 0.6 });
        expect(physicalModel15[0].position.y).to.eq(30);

        expect(() => clefTranspositionGlyphs(1, 10, defaultMetrics, 0)).to.throw(/Illegal clef transposition/);
        expect(() => clefTranspositionGlyphs(2, 10, defaultMetrics, 0)).to.throw(/Illegal clef transposition/);
        expect(() => clefTranspositionGlyphs(6, 10, defaultMetrics, 0)).to.throw(/Illegal clef transposition/);
        expect(() => clefTranspositionGlyphs(8, 10, defaultMetrics, 0)).to.throw(/Illegal clef transposition/);
        expect(() => clefTranspositionGlyphs(15, 10, defaultMetrics, 0)).to.throw(/Illegal clef transposition/);
        expect(() => clefTranspositionGlyphs(-1, 10, defaultMetrics, 0)).to.throw(/Illegal clef transposition/);
        expect(() => clefTranspositionGlyphs(-13, 10, defaultMetrics, 0)).to.throw(/Illegal clef transposition/);

    });



});
