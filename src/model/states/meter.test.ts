import { expect } from 'chai';
import { MeterFactory, RegularMeterDef } from './meter';
describe('Meter', () => {
    describe('Regular meter', () => {
        let meter1: RegularMeterDef, meter2: RegularMeterDef, meter3: RegularMeterDef;
        let meterFactory: MeterFactory;
        beforeEach(() => {
            meter1 = {
                count: 3,
                value: 4,
                upBeat: undefined
            };
            meter2 = {
                count: 3,
                value: 4,
                upBeat: { numerator: 1, denominator: 8, type: 'span' }
            };
            meter3 = {
                count: 6,
                value: 8,
                upBeat: undefined
            };            
        });

        it('should create a regular meter', () => {
            const meter = MeterFactory.createRegularMeter(meter1);
        });

        it('should have a counting time', () => {
            const meter = MeterFactory.createRegularMeter(meter1);
            expect(meter.countingTime).to.be.deep.eq({ numerator: 1, denominator: 4, type: 'span' });
        });
        it('should have a correct bar length', () => {
            let meter = MeterFactory.createRegularMeter(meter1);
            expect(meter.measureLength).to.be.deep.eq({ numerator: 3, denominator: 4, type: 'span' });

            meter = MeterFactory.createRegularMeter(meter3);
            expect(meter.measureLength).to.be.deep.eq({ numerator: 3, denominator: 4, type: 'span' });
        });
    });


    describe('Composite meter', () => {
        let meter1: RegularMeterDef, meter2: RegularMeterDef, meter3: RegularMeterDef;
        let meterFactory: MeterFactory;
        beforeEach(() => {
            meter1 = {
                count: 3,
                value: 4,
                upBeat: undefined
            };
            meter2 = {
                count: 3,
                value: 4,
                upBeat: { numerator: 1, denominator: 8, type: 'span' }
            };
            meter3 = {
                count: 1,
                value: 8,
                upBeat: undefined
            };
        });


        it('should create a composite meter', () => {
            const meter = MeterFactory.createCompositeMeter({ meters: [meter1, meter3] });
            expect(meter.countingTime).to.be.deep.eq({ numerator: 1, denominator: 4, type: 'span' });
        });
    });
});