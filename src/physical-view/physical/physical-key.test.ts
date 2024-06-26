import { AccidentalViewModel } from './../../logical-view';
import { expect } from 'chai';
import { KeyViewModel } from './../../logical-view';
/* eslint-disable comma-dangle */
import { Metrics, StandardMetrics } from './metrics';
import { convertAccidentals, convertKey } from './physical-key';

describe('Physical model, keys', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;
    let keyC: KeyViewModel;
    let keyCCancel: KeyViewModel;
    let keyAs: KeyViewModel;
    let keyH: KeyViewModel;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            scaleDegreeUnit: 3,
            staffLengthOffset: 8,
        });
        keyC = {
            keyPositions: []
        };
        keyAs = { 
            keyPositions: [0, 3, -1, 2].map(p => ({ position: p, alteration: -1 }))
        };
        keyCCancel = {
            keyPositions: [0, 3, -1, 2].map(p => ({ position: p, alteration: 0 }))
        };
        keyH = {
            keyPositions: [4, 1, 5, 2, -1].map(p => ({ position: p, alteration: 1 }))
        };
    
    });


    it('should make a physical flat key signature', () => {
        const resultC = convertKey(keyC, 30, defaultMetrics);

        expect(resultC).to.deep.eq([]);

        const resultAs = convertKey(keyAs, 30, defaultMetrics);

        expect(resultAs.length).to.eq(4);
        expect(resultAs[0]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30, y: 2*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultAs[1]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30 + defaultMetrics.keySigSpacing, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultAs[2]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30 + 2*defaultMetrics.keySigSpacing, y: 1.5*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultAs[3]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30 + 3*defaultMetrics.keySigSpacing, y: 3*defaultMetrics.scaleDegreeUnit*2 }});

    });

    it('should make a physical sharp key signature', () => {
        const resultAs = convertKey(keyH, 30, defaultMetrics);

        expect(resultAs.length).to.eq(5);
        expect(resultAs[0]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30, y: 4*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultAs[1]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30 + defaultMetrics.keySigSpacing, y: 2.5*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultAs[2]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30 + 2*defaultMetrics.keySigSpacing, y: 4.5*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultAs[3]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30 + 3*defaultMetrics.keySigSpacing, y: 3*defaultMetrics.scaleDegreeUnit*2 }});

    });


    it('should make a physical natural key signature', () => {
        const resultCCancel = convertKey(keyCCancel, 30, defaultMetrics);

        expect(resultCCancel.length).to.eq(4);
        expect(resultCCancel[0]).to.deep.eq({ glyph: 'accidentals.0', position: { x: 30, y: 2*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultCCancel[1]).to.deep.eq({ glyph: 'accidentals.0', position: { x: 30 + defaultMetrics.keySigSpacing, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultCCancel[2]).to.deep.eq({ glyph: 'accidentals.0', position: { x: 30 + 2*defaultMetrics.keySigSpacing, y: 1.5*defaultMetrics.scaleDegreeUnit*2 }});
        expect(resultCCancel[3]).to.deep.eq({ glyph: 'accidentals.0', position: { x: 30 + 3*defaultMetrics.keySigSpacing, y: 3*defaultMetrics.scaleDegreeUnit*2 }});

    });


});


describe('Physical model, accidentals', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;
    let acc1: AccidentalViewModel;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            scaleDegreeUnit: 3,
            staffLengthOffset: 8,
        });
        acc1 = {
            position: -3,
            alteration: 1,
            displacement: 0
        };
    
    });


    it('should draw accidentals', () => {
        let res = convertAccidentals([acc1], 30, defaultMetrics);
        expect(res).to.deep.eq([{ glyph: 'accidentals.2', position: { x: 30, y: 0.5*defaultMetrics.scaleDegreeUnit*2 }}]);

        acc1.alteration = 2;
        res = convertAccidentals([acc1], 30, defaultMetrics);
        expect(res).to.deep.eq([{ glyph: 'accidentals.doublesharp', position: { x: 30, y: 0.5*defaultMetrics.scaleDegreeUnit*2 }}]);

        acc1.alteration = -1;
        res = convertAccidentals([acc1], 30, defaultMetrics);
        expect(res).to.deep.eq([{ glyph: 'accidentals.M2', position: { x: 30, y: 0.5*defaultMetrics.scaleDegreeUnit*2 }}]);

        acc1.alteration = -2;
        res = convertAccidentals([acc1], 30, defaultMetrics);
        expect(res).to.deep.eq([{ glyph: 'accidentals.flatflat', position: { x: 30, y: 0.5*defaultMetrics.scaleDegreeUnit*2 }}]);

        acc1.alteration = 0;
        res = convertAccidentals([acc1], 30, defaultMetrics);
        expect(res).to.deep.eq([{ glyph: 'accidentals.0', position: { x: 30, y: 0.5*defaultMetrics.scaleDegreeUnit*2 }}]);

    });


});