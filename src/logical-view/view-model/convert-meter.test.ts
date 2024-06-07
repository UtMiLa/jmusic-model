import { Meter, MeterFactory } from './../../model/states/meter';
import { Key } from './../../model/states/key';
import { Clef } from './../../model/states/clef';
import { expect } from 'chai';
import { keyToView } from './convert-key';
import { meterToView } from './convert-meter';

describe('View model: Meters', () => {

    let meter4_4: Meter, meter3_4: Meter, meter12_16: Meter;

    beforeEach(() => { 
        meter4_4 = MeterFactory.createRegularMeter({ count: 4, value: 4});
        meter3_4 = MeterFactory.createRegularMeter({ count: 3, value: 4});
        meter12_16 = MeterFactory.createRegularMeter({ count: 12, value: 16});
    });

    it('should convert a meter to view model', () => {
        const meterView = meterToView(meter4_4);
        expect(meterView).to.deep.equal({ meterText: [['4', '4']] });
    });

    it('should convert a meter with more digits to view model', () => {
        const meterView = meterToView(meter12_16);
        expect(meterView).to.deep.equal({ meterText: [['12', '16']] });
    });

});

