import { SimpleSequence } from './../../model/score/sequence';
import { StateChange } from './../../model/states/state';
import { Time } from './../../model/rationals/time';
import { expect } from 'chai';
import { ClefType } from './../../model/states/clef';
import { StaffDef } from './../../model/score/staff';
import { createScopedTimeMap, __internal } from './../../logical-view/view-model/convert-model';
import { Metrics, StandardMetrics } from './metrics';
import { generateMeasureMap, MeasureMap, MeasureMapItem, MeasureMapXValueItem } from './measure-map';
import { StaffViewModel } from '../../logical-view/view-model/score-view-model';
import { TimeMap } from '../../tools/time-map';
import { createTestScoreVM } from '../../tools/test-tools';

describe('Physical model, measure map', () => {
    let defaultMetrics: Metrics;
    let staffViewModel: StaffViewModel;
    //let measureMapMaster: MeasureMap;

    beforeEach(() => {
        defaultMetrics = new StandardMetrics();

        const staff = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialMeter: { count: 4, value: 4 },
            initialKey: { accidental: -1, count: 0 },
            voices: [{
                content: new SimpleSequence('c4 d2 e4 f1')
            }]
        } as StaffDef;

        staffViewModel = __internal.staffModelToViewModel(staff, createScopedTimeMap());
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
            initialKey: { accidental: -1, count: 0 },
            voices: [{
                content: new SimpleSequence('c4 <fis, ais, cis dis>2')
            }]
        } as StaffDef;

        const staffViewModel1 = __internal.staffModelToViewModel(staff, createScopedTimeMap());

        expect((staffViewModel1.timeSlots[1].accidentals as any)[0].displacement).to.eq(-3);
        expect((staffViewModel1.timeSlots[1].accidentals as any)[1].displacement).to.eq(-2);
        expect((staffViewModel1.timeSlots[1].accidentals as any)[2].displacement).to.eq(-1);

        const res = MeasureMap.generate(staffViewModel1, defaultMetrics);

        expect(res.measureMap.length).to.eq(2);

        expect(res.measureMap[1]).to.deep.include({
            absTime: Time.newAbsolute(1, 4),
            width: defaultMetrics.defaultSpacing + defaultMetrics.accidentalSpacing + 3 * defaultMetrics.accidentalDisplacement,
            startPos: 80 + defaultMetrics.leftMargin,
            widths: {
                accidentals: defaultMetrics.accidentalSpacing + 3 * defaultMetrics.accidentalDisplacement,
                note: 20
            }
        });


        const xpos1 = res.lookup(Time.newAbsolute(1, 4));

        expect(xpos1).to.deep.include({
            accidentals: 80 + defaultMetrics.leftMargin + 3 * defaultMetrics.accidentalDisplacement
        });
    });

    it('should convert x,y coordinates to objects', () => {
        const score = createTestScoreVM([[
            'c\'\'4 c\'\'4 cis\'\'4 c\'\'4',
            'c\'8 c\'4 c\'4 c\'4 c\'8'
        ], [
            'c2 c4 c4'
        ]], [4, 4], [-1, 3]);

        const mm = generateMeasureMap(score, defaultMetrics);



        const map = {
            'measureMap': [
                {
                    'absTime': { 'numerator': 0, 'denominator': 1, 'type': 'abs' },
                    'width': 98,
                    'startPos': 10,
                    'widths': {
                        'clef': 20,
                        'key': 38,
                        'meter': 20,
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 1, 'denominator': 8, 'type': 'abs' },
                    'width': 20,
                    'startPos': 108,
                    'widths': {
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 1, 'denominator': 4, 'type': 'abs' },
                    'width': 20,
                    'startPos': 128,
                    'widths': {
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 3, 'denominator': 8, 'type': 'abs' },
                    'width': 20,
                    'startPos': 148,
                    'widths': {
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 1, 'denominator': 2, 'type': 'abs' },
                    'width': 29,
                    'startPos': 168,
                    'widths': {
                        'accidentals': 9,
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 5, 'denominator': 8, 'type': 'abs' },
                    'width': 20,
                    'startPos': 197,
                    'widths': {
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 3, 'denominator': 4, 'type': 'abs'},
                    'width': 29,
                    'startPos': 217,
                    'widths': {
                        'accidentals': 9,
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 7, 'denominator': 8, 'type': 'abs' },
                    'width': 20,
                    'startPos': 246,
                    'widths': {
                        'note': 20
                    }
                },
                {
                    'absTime': { 'numerator': 1, 'denominator': 1, 'type': 'abs' },
                    'width': 8,
                    'startPos': 266,
                    'widths': {
                        'bar': 8
                    }
                }
            ]
        };


        expect(mm.localize(25, 10)).to.deep.eq({
            time: Time.newAbsolute(0, 1),
            staff: 0,
            item: 'clef',
            pitch: 3
        });

        expect(mm.localize(46, 10)).to.deep.eq({
            time: Time.newAbsolute(0, 1),
            staff: 0,
            item: 'key',
            pitch: 3
        });

        expect(mm.localize(120, 10)).to.deep.eq({
            time: Time.newAbsolute(1, 8),
            staff: 0,
            item: 'note',
            pitch: 3
        });

        expect(mm.localize(170, 10)).to.deep.eq({
            time: Time.newAbsolute(1, 2),
            staff: 0,
            item: 'accidentals',
            pitch: 3
        });

        expect(mm.localize(178, 10)).to.deep.eq({
            time: Time.newAbsolute(1, 2),
            staff: 0,
            item: 'note',
            pitch: 3
        });


    });

});

