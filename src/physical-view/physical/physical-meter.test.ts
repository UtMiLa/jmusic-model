import { MeterViewModel } from './../../logical-view/view-model/convert-meter';
import { expect } from 'chai';
import { KeyViewModel } from './../../logical-view/view-model/convert-key';
import { Key } from './../../model/states/key';
/* eslint-disable comma-dangle */
import { Metrics, StandardMetrics } from './metrics';
import { convertKey } from './physical-key';
import { convertMeter } from './physical-meter';

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


    it('should make a physical 6/8 meter', () => {
        const meterView: MeterViewModel = { meterText: ['6', '8'] };

        const res = convertMeter(meterView, 40, defaultMetrics);

        expect(res).to.deep.equal([
            {
                glyph: 'six',
                position: { x: 40, y: 2 * defaultMetrics.staffLineWidth }
            },{
                glyph: 'eight',
                position: { x: 40, y: 0 }
            }
        ]);
    });
    
    it('should make a physical 12/16 meter', () => {
        const meterView: MeterViewModel = { meterText: ['12', '16'] };

        const res = convertMeter(meterView, 50, defaultMetrics);

        expect(res).to.deep.equal([
            {
                glyph: 'one',
                position: { x: 50, y: 2 * defaultMetrics.staffLineWidth }
            },
            {
                glyph: 'two',
                position: { x: 50 + 5, y: 2 * defaultMetrics.staffLineWidth }
            },
            {
                glyph: 'one',
                position: { x: 50, y: 0 }
            },
            {
                glyph: 'six',
                position: { x: 50 + 5, y: 0 }
            }
        ]);
    });

});