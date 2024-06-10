import { RegularMeterDef } from './../data-only/states';
import { StateChange } from './state';
import { Time } from './../rationals/time';
import { parseLilyMeter, SimpleSequence, __internal } from './../score/sequence';
import { expect } from 'chai';
import { getAllBars, Meter, MeterFactory, MeterMap, meterToLilypond } from './meter';
describe('Meter', () => {
    describe('Regular meter', () => {
        let meter1: RegularMeterDef, meter2: RegularMeterDef, meter3: RegularMeterDef;
        
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
            expect(meter.countingTime).to.be.deep.eq([{ numerator: 1, denominator: 4, type: 'span' }]);

            const meter68 = MeterFactory.createRegularMeter(meter3);
            expect(meter68.countingTime).to.be.deep.eq([{ numerator: 3, denominator: 8, type: 'span' }]);

        });

        it('should have a correct bar length', () => {
            let meter = MeterFactory.createRegularMeter(meter1);
            expect(meter.measureLength).to.be.deep.eq({ numerator: 3, denominator: 4, type: 'span' });

            meter = MeterFactory.createRegularMeter(meter3);
            expect(meter.measureLength).to.be.deep.eq({ numerator: 3, denominator: 4, type: 'span' });
        });

        it('should report time for first bar', () => {
            const meter = MeterFactory.createRegularMeter(meter1);
            expect(meter.firstBarTime).to.be.deep.eq({ numerator: 3, denominator: 4, type: 'abs' });
            const meterUp = MeterFactory.createRegularMeter(meter2);
            expect(meterUp.firstBarTime).to.be.deep.eq({ numerator: 1, denominator: 8, type: 'abs' });
        });

        it('should report time for any bar', () => {
            const meter = MeterFactory.createRegularMeter(meter1);

            const iterator = getAllBars(meter);
            expect(iterator.next().value).to.be.deep.eq({ numerator: 3, denominator: 4, type: 'abs' });
            expect(iterator.next().value).to.be.deep.eq({ numerator: 3, denominator: 2, type: 'abs' });
            
            const meterUp = MeterFactory.createRegularMeter(meter2);
            const iterator2 = getAllBars(meterUp);
            expect(iterator2.next().value).to.be.deep.eq({ numerator: 1, denominator: 8, type: 'abs' });
            expect(iterator2.next().value).to.be.deep.eq({ numerator: 7, denominator: 8, type: 'abs' });
            expect(iterator2.next().value).to.be.deep.eq({ numerator: 13, denominator: 8, type: 'abs' });

        });

        it('should parse a meter change', () => {
            const seq = new SimpleSequence( 'c4 \\meter 3/4 c4' );
    
            expect(seq.count).to.eq(3);
            expect(seq.elements[1]).to.deep.eq({
                meter: MeterFactory.createRegularMeter({ count: 3, value: 4 }),
                isState: true
            });
    
        });
    
    
        it('should parse different regular meter changes', () => {
            expect(parseLilyMeter('\\meter 3/4')).to.deep.eq(MeterFactory.createRegularMeter({ count: 3, value: 4 }));
            expect(parseLilyMeter('\\meter 2/2')).to.deep.eq(MeterFactory.createRegularMeter({ count: 2, value: 2 }));
            expect(parseLilyMeter('\\meter 6/8')).to.deep.eq(MeterFactory.createRegularMeter({ count: 6, value: 8 }));
            expect(parseLilyMeter('\\meter 12/16')).to.deep.eq(MeterFactory.createRegularMeter({ count: 12, value: 16 }));
            expect(parseLilyMeter('\\meter 4/4')).to.deep.eq(MeterFactory.createRegularMeter({ count: 4, value: 4 }));    
        });
    
        it('should convert different regular meter changes to Lilypond', () => {
            expect(meterToLilypond(MeterFactory.createRegularMeter({ count: 3, value: 4 }))).to.deep.eq('\\meter 3/4');
            expect(meterToLilypond(MeterFactory.createRegularMeter({ count: 2, value: 2 }))).to.deep.eq('\\meter 2/2');
            expect(meterToLilypond(MeterFactory.createRegularMeter({ count: 6, value: 8 }))).to.deep.eq('\\meter 6/8');
            expect(meterToLilypond(MeterFactory.createRegularMeter({ count: 12, value: 16 }))).to.deep.eq('\\meter 12/16');
            expect(meterToLilypond(MeterFactory.createRegularMeter({ count: 4, value: 4 }))).to.deep.eq('\\meter 4/4');
        });
    
        it('should compare two meter changes', () => {
            const meter1 = MeterFactory.createRegularMeter({ count: 6, value: 8 });
            const meter2 = MeterFactory.createRegularMeter({ count: 3, value: 4 });
            const meter3 = MeterFactory.createRegularMeter({ count: 3, value: 4 });

            expect(meter1.equals(meter2)).to.be.false;
            expect(meter3.equals(meter2)).to.be.true;
        });

        it('should compare two meters with upbeats', () => {
            const meter1 = MeterFactory.createRegularMeter({ count: 3, value: 4, upBeat: Time.EightsTime });
            const meter2 = MeterFactory.createRegularMeter({ count: 3, value: 4, upBeat: Time.EightsTime });
            const meter3 = MeterFactory.createRegularMeter({ count: 3, value: 4, upBeat: Time.QuarterTime });
            const meter4 = MeterFactory.createRegularMeter({ count: 3, value: 4 });

            expect(meter1.equals(meter2)).to.be.true;
            expect(meter1.equals(meter3)).to.be.false;
            expect(meter1.equals(meter4)).to.be.false;
            expect(meter4.equals(meter1)).to.be.false;
            expect(meter3.equals(meter4)).to.be.false;
            expect(meter3.equals({} as Meter)).to.be.false;
        });
    });


    describe('Composite meter', () => {
        let meter1: RegularMeterDef, meter1a: RegularMeterDef, meter2: RegularMeterDef, meter3: RegularMeterDef;
        
        beforeEach(() => {
            meter1 = {
                count: 3,
                value: 4,
                upBeat: undefined
            };
            meter1a = {
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
            expect(meter.countingTime).to.be.deep.eq([{ numerator: 3, denominator: 4, type: 'span' }, { numerator: 1, denominator: 8, type: 'span' }]);
            expect(meter.measureLength).to.be.deep.eq({ numerator: 7, denominator: 8, type: 'span' });
        });

        
        it('should compare composite meters', () => {
            const meterA = MeterFactory.createCompositeMeter({ meters: [meter1, meter3] });
            const meterB = MeterFactory.createCompositeMeter({ meters: [meter1, meter2] });
            const meterC = MeterFactory.createCompositeMeter({ meters: [meter1a, meter3] });
            const meterD = MeterFactory.createCompositeMeter({ meters: [meter2, meter3] });
            expect(meterA.equals(meterB)).to.be.false;
            expect(meterA.equals(meterC)).to.be.true;
            expect(meterA.equals(meterD)).to.be.false;
            expect(meterC.equals(meterB)).to.be.false;
        });


        it('should format a composite meter', () => {
            const meter = MeterFactory.createCompositeMeter({ meters: [meter1, meter3] });
            expect(meter.text).to.be.deep.eq([['3', '4'], ['+'], ['1', '8']]);
        });

        it('should format a composite meter with a common denominator', () => {
            const meter = MeterFactory.createCompositeMeter({ meters: [meter1, meter1a], commonDenominator: true });
            expect(meter.text).to.be.deep.eq([['3+3', '4']]);
        });
        
    });


    describe('Meter map', () => {
        it('should generate correct bars after meter change', () => {
            const meterMap = new MeterMap();

            meterMap.add(Time.newAbsolute(0, 1), MeterFactory.createRegularMeter({ count: 4, value: 4 }));
            meterMap.add(Time.newAbsolute(3, 1), MeterFactory.createRegularMeter({ count: 3, value: 4 }));
            meterMap.add(Time.newAbsolute(6, 1), MeterFactory.createRegularMeter({ count: 6, value: 8 }));

            const barsIterator = meterMap.getAllBars();

            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(0, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(2, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(15, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(9, 2)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(21, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(6, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(27, 4)});
        });

        it('should generate correct bars after composite meter change', () => {
            const meterMap = new MeterMap();

            meterMap.add(Time.newAbsolute(0, 1), MeterFactory.createRegularMeter({ count: 4, value: 4 }));
            meterMap.add(Time.newAbsolute(1, 1), MeterFactory.createCompositeMeter({ 
                meters: [
                    { count: 3, value: 8 }, 
                    { count: 3, value: 8 }, 
                    { count: 2, value: 8 }
                ],
                commonDenominator: true
            }));
            meterMap.add(Time.newAbsolute(3, 1), MeterFactory.createRegularMeter({ count: 3, value: 4 }));
            meterMap.add(Time.newAbsolute(5, 1), MeterFactory.createCompositeMeter({ 
                meters: [
                    { count: 3, value: 4 }, 
                    { count: 1, value: 8 }
                ],
                commonDenominator: false
            }));

            const barsIterator = meterMap.getAllBars();

            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(0, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(2, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(15, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(9, 2)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(21, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(49, 8)});
        });


        it('should generate correct bars after meter change with upbeat', () => {
            const meterMap = new MeterMap();

            meterMap.add(Time.newAbsolute(0, 1), MeterFactory.createRegularMeter({ count: 4, value: 4, upBeat: Time.newSpan(3, 8) }));
            meterMap.add(Time.newAbsolute(11, 8), MeterFactory.createRegularMeter({ count: 3, value: 4 }));

            const barsIterator = meterMap.getAllBars();

            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 8)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(11, 8)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(17, 8)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(23, 8)});
        });

        it('should generate correct beats after meter change', () => {
            const meterMap = new MeterMap();

            meterMap.add(Time.newAbsolute(0, 1), MeterFactory.createRegularMeter({ count: 4, value: 4 }));
            meterMap.add(Time.newAbsolute(2, 1), MeterFactory.createRegularMeter({ count: 6, value: 8 }));
            meterMap.add(Time.newAbsolute(5, 1), MeterFactory.createRegularMeter({ count: 3, value: 4 }));

            const barsIterator = meterMap.getAllBeats();

            //expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(0, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 2)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 1)});
            barsIterator.next();
            barsIterator.next();
            barsIterator.next();

            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(2, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(19, 8)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(11, 4)});
        });

        it('should generate correct beats after composite meter change', () => {
            const meterMap = new MeterMap();

            meterMap.add(Time.newAbsolute(0, 1), MeterFactory.createRegularMeter({ count: 4, value: 4 }));
            meterMap.add(Time.newAbsolute(1, 1), MeterFactory.createCompositeMeter({ 
                meters: [
                    { count: 3, value: 8 }, 
                    { count: 3, value: 8 }, 
                    { count: 2, value: 8 }
                ],
                commonDenominator: true
            }));
            meterMap.add(Time.newAbsolute(2, 1), MeterFactory.createRegularMeter({ count: 3, value: 4 }));

            const barsIterator = meterMap.getAllBeats();

            // 4/4
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 2)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 4)});

            // 3+3+2/8
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 1)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(11, 8)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(7, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(2, 1)});

            // 3/4
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(9, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(5, 2)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(11, 4)});

        });

        it('should generate correct beats when composite meter goes first', () => {
            const meterMap = new MeterMap();

            meterMap.add(Time.newAbsolute(0, 1), MeterFactory.createCompositeMeter({ 
                meters: [
                    { count: 3, value: 8 }, 
                    { count: 3, value: 8 }, 
                    { count: 2, value: 8 }
                ],
                commonDenominator: true
            }));
            meterMap.add(Time.newAbsolute(1, 1), MeterFactory.createRegularMeter({ count: 3, value: 4 }));

            const barsIterator = meterMap.getAllBeats();

            // 3+3+2/8
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 8)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(1, 1)});

            // 3/4
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(5, 4)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(3, 2)});
            expect(barsIterator.next()).to.deep.equal({done: false, value: Time.newAbsolute(7, 4)});
        });



    });
});