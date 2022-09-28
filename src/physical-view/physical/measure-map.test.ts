import { Time } from './../../model/rationals/time';
import { expect } from 'chai';
import { ClefType } from './../../model/states/clef';
import { StaffDef } from './../../model/score/staff';
import { staffModelToViewModel, StaffViewModel } from './../../logical-view/view-model/convert-model';
import { Metrics, StandardMetrics } from './metrics';
import { MeasureMap, MeasureMapItem, MeasureMapXValueItem } from './measure-map';

describe('Physical model, measure map', () => {
    let defaultMetrics: Metrics;
    let staffViewModel: StaffViewModel;
    //let measureMapMaster: MeasureMap;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();

        const staff = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialMeter: { count: 4, value: 4 },
            initialKey: { accidental: -1, count: 0},
            voices: [{
                content: { elements: 'c4 d2 e4 f1'}
            }]
        } as StaffDef;

        staffViewModel = staffModelToViewModel(staff);
        //measureMapMaster = new MeasureMap();
    });


    it('should generate a memory map for one voice', () => {
        const res = MeasureMap.generate(staffViewModel, defaultMetrics);

        expect(res.measureMap.length).to.eq(5); // 4 notes and an extra bar line

        staffViewModel.timeSlots.forEach(ts => { // all timeslots must have a matching map
            expect(res.measureMap.find(m => Time.equals(m.absTime, ts.absTime))).to.not.be.undefined;
        });

        expect(res.measureMap[0]).to.deep.include({
            absTime: Time.newAbsolute(0, 1),
            width: 4 * defaultMetrics.defaultSpacing,
            startPos: defaultMetrics.leftMargin,
            xValue: {
                clef: 0,
                key: 20,
                meter: 40,
                note: 60
            }
        });

        expect(res.measureMap[1]).to.deep.include({
            absTime: Time.newAbsolute(1, 4),
            width: defaultMetrics.defaultSpacing,
            startPos: 80 + defaultMetrics.leftMargin,
            xValue: {
                note: 0
            }
        });

        expect(res.measureMap[2]).to.deep.include({
            absTime: Time.newAbsolute(3, 4),
            width: defaultMetrics.defaultSpacing
        });

        expect(res.measureMap[3]).to.deep.include({
            absTime: Time.newAbsolute(1, 1),
            width: defaultMetrics.afterBarSpacing + defaultMetrics.defaultSpacing,
            startPos: 6 * defaultMetrics.defaultSpacing + defaultMetrics.leftMargin,
            xValue: {
                bar: 0,
                note: 8
            }
        });

        expect(res.measureMap[4]).to.deep.include({
            absTime: Time.newAbsolute(2, 1),
            width: defaultMetrics.afterBarSpacing
        });

    });




    it('should allow for lookup in a memory map', () => {

        const measureMap = MeasureMap.generate(staffViewModel, defaultMetrics);

        //console.log('map', map);
        

        expect(measureMap.lookup(Time.newAbsolute(0, 1))).to.deep.equal({
            clef: defaultMetrics.leftMargin,
            key: 20 + defaultMetrics.leftMargin,
            meter: 40 + defaultMetrics.leftMargin,
            note: 60 + defaultMetrics.leftMargin
        });

        expect(measureMap.lookup(Time.newAbsolute(1, 4))).to.deep.equal({
            note: 80 + defaultMetrics.leftMargin
        });       

        expect(measureMap.lookup(Time.newAbsolute(2, 1))).to.deep.equal({
            bar: 7 * defaultMetrics.defaultSpacing + defaultMetrics.leftMargin + defaultMetrics.afterBarSpacing
        });       

    });


    it('should merge two measure maps', () => {
        const measureMap1: MeasureMapItem[] = [
            {
                absTime: Time.newAbsolute(0, 1),
                width: 25,
                startPos: 10,
                xValue: {
                    clef: 0,
                    key: 10,
                    meter: 15,
                    note: 20
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 4),
                width: 20,
                startPos: 35,
                xValue: {
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(3, 4),
                width: 20,
                startPos: 55,
                xValue: {
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 1),
                width: 20,
                startPos: 75,
                xValue: {
                    bar: 0,
                    note: 10
                } as MeasureMapXValueItem
            }
        ];
        const measureMap2: MeasureMapItem[] = [
            {
                absTime: Time.newAbsolute(0, 1),
                width: 25,
                startPos: 10,
                xValue: {
                    clef: 0,
                    key: 8,
                    meter: 15,
                    note: 20
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 2),
                width: 5,
                startPos: 35,
                xValue: {
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(3, 4),
                width: 5,
                startPos: 40,
                xValue: {
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 1),
                width: 20,
                startPos: 45,
                xValue: {
                    bar: 0,
                    note: 10
                } as MeasureMapXValueItem
            }
        ];

        const _measureMap1 = new MeasureMap(measureMap1);

        const res = _measureMap1.mergeWith(new MeasureMap(measureMap2));

        expect(res.measureMap).to.deep.equal([
            {
                absTime: Time.newAbsolute(0, 1),
                width: 25,
                startPos: 10,
                xValue: {
                    clef: 0,
                    key: 10,
                    meter: 15,
                    note: 20
                }
            },
            {
                absTime: Time.newAbsolute(1, 4),
                width: 20,
                startPos: 35,
                xValue: {
                    note: 0
                }
            },
            {
                absTime: Time.newAbsolute(1, 2),
                width: 5,
                startPos: 55,
                xValue: {
                    note: 0
                }
            },
            {
                absTime: Time.newAbsolute(3, 4),
                width: 20,
                startPos: 60,
                xValue: {
                    note: 0
                }
            },
            {
                absTime: Time.newAbsolute(1, 1),
                width: 20,
                startPos: 80,
                xValue: {
                    bar: 0,
                    note: 10
                }
            }

        ]);
    });


});

