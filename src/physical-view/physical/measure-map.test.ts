import { Time } from './../../model/rationals/time';
import { expect } from 'chai';
import { ClefType } from './../../model/states/clef';
import { StaffDef } from './../../model/score/staff';
import { staffModelToViewModel } from './../../logical-view/view-model/convert-model';
import { Metrics, StandardMetrics } from './metrics';
import { MeasureMap, MeasureMapItem, MeasureMapXValueItem } from './measure-map';
import { StaffViewModel } from '~/logical-view/view-model/score-view-model';

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


    it('should generate a measure map for one voice', () => {
        const res = MeasureMap.generate(staffViewModel, defaultMetrics);

        expect(res.measureMap.length).to.eq(5); // 4 notes and an extra bar line

        staffViewModel.timeSlots.forEach(ts => { // all timeslots must have a matching map
            expect(res.measureMap.find(m => Time.equals(m.absTime, ts.absTime))).to.not.be.undefined;
        });

        expect(res.measureMap[0]).to.deep.include({
            absTime: Time.newAbsolute(0, 1),
            width: 4 * defaultMetrics.defaultSpacing,
            startPos: defaultMetrics.leftMargin,
            widths: {
                clef: 20,
                key: 20,
                meter: 20,
                note: 20
            }
        });

        expect(res.measureMap[1]).to.deep.include({
            absTime: Time.newAbsolute(1, 4),
            width: defaultMetrics.defaultSpacing,
            startPos: 80 + defaultMetrics.leftMargin,
            widths: {
                note: 20
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
            widths: {
                bar: 8,
                note: 20
            }
        });

        expect(res.measureMap[4]).to.deep.include({
            absTime: Time.newAbsolute(2, 1),
            width: defaultMetrics.afterBarSpacing
        });

    });




    it('should allow for lookup in a measure map', () => {

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
                widths: {
                    clef: 10,
                    key: 5,
                    meter: 5,
                    note: 5
                } as MeasureMapXValueItem,
                offsets: {
                    clef: 0,
                    key: 0,
                    meter: 0,
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 4),
                width: 20,
                startPos: 35,
                widths: {
                    note: 10
                } as MeasureMapXValueItem,
                offsets: {
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(3, 4),
                width: 20,
                startPos: 55,
                widths: {
                    note: 5
                } as MeasureMapXValueItem,
                offsets: {
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 1),
                width: 20,
                startPos: 75,
                widths: {
                    bar: 10,
                    note: 10
                } as MeasureMapXValueItem,
                offsets: {
                    bar: 0,
                    note: 0
                } as MeasureMapXValueItem
            }
        ];
        const measureMap2: MeasureMapItem[] = [
            {
                absTime: Time.newAbsolute(0, 1),
                width: 25,
                startPos: 10,
                widths: {
                    clef: 8,
                    key: 8,
                    meter: 15,
                    note: 20
                } as MeasureMapXValueItem,
                offsets: {
                    clef: 0,
                    key: 0,
                    meter: 0,
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 2),
                width: 5,
                startPos: 35,
                widths: {
                    note: 10
                } as MeasureMapXValueItem,
                offsets: {
                    note: 0
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(3, 4),
                width: 5,
                startPos: 40,
                widths: {
                    note: 20
                } as MeasureMapXValueItem,
                offsets: {
                    note: 10
                } as MeasureMapXValueItem
            },
            {
                absTime: Time.newAbsolute(1, 1),
                width: 20,
                startPos: 45,
                widths: {
                    bar: 10,
                    note: 10
                } as MeasureMapXValueItem,
                offsets: {
                    bar: 0,
                    note: 0
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
                widths: {
                    clef: 10,
                    key: 8,
                    meter: 15,
                    note: 20
                },
                offsets: {
                    clef: 0,
                    key: 0,
                    meter: 0,
                    note: 0
                }
            },
            {
                absTime: Time.newAbsolute(1, 4),
                width: 20,
                startPos: 35,
                widths: {
                    note: 10
                },
                offsets: {
                    note: 0
                }
            },
            {
                absTime: Time.newAbsolute(1, 2),
                width: 5,
                startPos: 55,
                widths: {
                    note: 10
                },
                offsets: {
                    note: 0
                }
            },
            {
                absTime: Time.newAbsolute(3, 4),
                width: 20,
                startPos: 60,
                widths: {
                    note: 20
                },
                offsets: {
                    note: 10
                }
            },
            {
                absTime: Time.newAbsolute(1, 1),
                width: 20,
                startPos: 80,
                widths: {
                    bar: 10,
                    note: 10
                },
                offsets: {
                    bar: 0,
                    note: 0
                }
            }

        ]);
    });



    it('should calculate accidental width and offset', () => {

        const staff = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialMeter: { count: 4, value: 4 },
            initialKey: { accidental: -1, count: 0},
            voices: [{
                content: { elements: 'c4 <fis, ais, cis dis>2'}
            }]
        } as StaffDef;

        const staffViewModel1 = staffModelToViewModel(staff);

        expect((staffViewModel1.timeSlots[1].accidentals as any)[0].displacement).to.eq(-3);
        expect((staffViewModel1.timeSlots[1].accidentals as any)[1].displacement).to.eq(-2);
        expect((staffViewModel1.timeSlots[1].accidentals as any)[2].displacement).to.eq(-1);

        const res = MeasureMap.generate(staffViewModel1, defaultMetrics);

        expect(res.measureMap.length).to.eq(2);

        expect(res.measureMap[1]).to.deep.include({
            absTime: Time.newAbsolute(1, 4),
            width: defaultMetrics.defaultSpacing + defaultMetrics.accidentalSpacing + 3*defaultMetrics.accidentalDisplacement,
            startPos: 80 + defaultMetrics.leftMargin,
            widths: {
                accidentals: defaultMetrics.accidentalSpacing + 3*defaultMetrics.accidentalDisplacement,
                note: 20
            }
        });


        const xpos1 = res.lookup(Time.newAbsolute(1, 4));

        expect(xpos1).to.deep.include({
            accidentals: 80 + defaultMetrics.leftMargin + 3*defaultMetrics.accidentalDisplacement
        });
    });



});

