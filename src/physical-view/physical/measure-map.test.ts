import { Time } from './../../model/rationals/time';
import { expect } from 'chai';
import { ClefType } from './../../model/states/clef';
import { StaffDef } from './../../model/score/staff';
import { staffModelToViewModel, StaffViewModel } from './../../logical-view/view-model/convert-model';
import { Metrics, StandardMetrics } from './metrics';
import { generateMeasureMap, lookupInMap } from './measure-map';

describe('Physical model, measure map', () => {
    let defaultMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
    });


    it('should generate a memory map for one voice', () => {
        const staff = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialMeter: { count: 4, value: 4 },
            initialKey: { accidental: -1, count: 0},
            voices: [{
                content: { elements: 'c4 d2 e4 f1'}
            }]
        } as StaffDef;

        const staffViewModel = staffModelToViewModel(staff);
        const res = generateMeasureMap(staffViewModel, defaultMetrics);

        expect(res.length).to.eq(5); // 4 notes and an extra bar line

        staffViewModel.timeSlots.forEach(ts => { // all timeslots must have a matching map
            expect(res.find(m => Time.equals(m.absTime, ts.absTime))).to.not.be.undefined;
        });

        expect(res[0]).to.deep.include({
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

        expect(res[1]).to.deep.include({
            absTime: Time.newAbsolute(1, 4),
            width: defaultMetrics.defaultSpacing,
            startPos: 80 + defaultMetrics.leftMargin,
            xValue: {
                note: 0
            }
        });

        expect(res[2]).to.deep.include({
            absTime: Time.newAbsolute(3, 4),
            width: defaultMetrics.defaultSpacing
        });

        expect(res[3]).to.deep.include({
            absTime: Time.newAbsolute(1, 1),
            width: defaultMetrics.afterBarSpacing + defaultMetrics.defaultSpacing,
            startPos: 6 * defaultMetrics.defaultSpacing + defaultMetrics.leftMargin,
            xValue: {
                bar: 0,
                note: 8
            }
        });

        expect(res[4]).to.deep.include({
            absTime: Time.newAbsolute(2, 1),
            width: defaultMetrics.afterBarSpacing
        });

    });




    it('should allow for lookup in a memory map', () => {
        const staff = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialMeter: { count: 4, value: 4 },
            initialKey: { accidental: -1, count: 0},
            voices: [{
                content: { elements: 'c4 d2 e4 f1'}
            }]
        } as StaffDef;

        const staffViewModel = staffModelToViewModel(staff);
        const map = generateMeasureMap(staffViewModel, defaultMetrics);

        console.log('map', map);
        

        expect(lookupInMap(map, Time.newAbsolute(0, 1))).to.deep.equal({
            clef: defaultMetrics.leftMargin,
            key: 20 + defaultMetrics.leftMargin,
            meter: 40 + defaultMetrics.leftMargin,
            note: 60 + defaultMetrics.leftMargin
        });

        expect(lookupInMap(map, Time.newAbsolute(1, 4))).to.deep.equal({
            note: 80 + defaultMetrics.leftMargin
        });
        /*

        expect(res[1]).to.deep.include({
            absTime: Time.newAbsolute(1, 4),
            width: defaultMetrics.defaultSpacing,
            startPos: 80 + defaultMetrics.leftMargin,
            xValue: {
                note: 0
            }
        });

        expect(res[2]).to.deep.include({
            absTime: Time.newAbsolute(3, 4),
            width: defaultMetrics.defaultSpacing
        });

        expect(res[3]).to.deep.include({
            absTime: Time.newAbsolute(1, 1),
            width: defaultMetrics.afterBarSpacing + defaultMetrics.defaultSpacing,
            startPos: 6 * defaultMetrics.defaultSpacing + defaultMetrics.leftMargin,
            xValue: {
                bar: 0,
                note: 8
            }
        });

        expect(res[4]).to.deep.include({
            absTime: Time.newAbsolute(2, 1),
            width: defaultMetrics.afterBarSpacing
        });*/

    });


});

