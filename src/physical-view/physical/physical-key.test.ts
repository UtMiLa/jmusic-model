import { expect } from 'chai';
import { KeyViewModel } from './../../logical-view';
/* eslint-disable comma-dangle */
import { Metrics, StandardMetrics } from './metrics';
import { convertKey } from './physical-key';

describe('Physical model, keys', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;
    let keyC: KeyViewModel;
    let keyAs: KeyViewModel;
    let keyH: KeyViewModel;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            staffLineWidth: 6,
            staffLengthOffset: 8,
        });
        keyC = {
            keyPositions: []
        };
        keyAs = { 
            keyPositions: [0, 3, -1, 2].map(p => ({ position: p, alternation: -1 }))
        };
        keyH = {
            keyPositions: [4, 1, 5, 2, -1].map(p => ({ position: p, alternation: 1 }))
        };
    
    });


    it('should make a physical flat key signature', () => {
        const resultC = convertKey(keyC, 30, defaultMetrics);

        expect(resultC).to.deep.eq([]);

        const resultAs = convertKey(keyAs, 30, defaultMetrics);

        expect(resultAs.length).to.eq(4);
        expect(resultAs[0]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30, y: 2*defaultMetrics.staffLineWidth }});
        expect(resultAs[1]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30 + defaultMetrics.keySigSpacing, y: 3.5*defaultMetrics.staffLineWidth }});
        expect(resultAs[2]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30 + 2*defaultMetrics.keySigSpacing, y: 1.5*defaultMetrics.staffLineWidth }});
        expect(resultAs[3]).to.deep.eq({ glyph: 'accidentals.M2', position: { x: 30 + 3*defaultMetrics.keySigSpacing, y: 3*defaultMetrics.staffLineWidth }});

    });

    it('should make a physical sharp key signature', () => {
        const resultAs = convertKey(keyH, 30, defaultMetrics);

        expect(resultAs.length).to.eq(5);
        expect(resultAs[0]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30, y: 4*defaultMetrics.staffLineWidth }});
        expect(resultAs[1]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30 + defaultMetrics.keySigSpacing, y: 2.5*defaultMetrics.staffLineWidth }});
        expect(resultAs[2]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30 + 2*defaultMetrics.keySigSpacing, y: 4.5*defaultMetrics.staffLineWidth }});
        expect(resultAs[3]).to.deep.eq({ glyph: 'accidentals.2', position: { x: 30 + 3*defaultMetrics.keySigSpacing, y: 3*defaultMetrics.staffLineWidth }});

    });


});