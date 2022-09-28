import { AbsoluteTime, Time } from './../../model';

import { Metrics } from './metrics';
import { StaffViewModel, TimeSlotViewModel } from './../../logical-view';

export type MeasureMapXValueItem = {
    [index in XValueKey]: number;
};

export type XValueKey = 'bar' | 'clef' | 'key' | 'note' | 'meter';

export interface MeasureMapItem {
    absTime: AbsoluteTime;
    width: number;
    startPos?: number;
    xValue: MeasureMapXValueItem;
}

export function getTimeSlotWidth(slot: TimeSlotViewModel, settings: Metrics): number {
    return getTimeSlotSpacing(slot, settings).width;
    //res;
}


export function getTimeSlotSpacing(slot: TimeSlotViewModel, settings: Metrics): MeasureMapItem {
    const res: MeasureMapItem = { absTime: slot.absTime, width: 0, xValue: {} as MeasureMapXValueItem };
    /* Ordering of objects when absTime is identical:
    0	Accolade
    10	StartBar
    20	Ambitus
    30	StartClef
    40	StartKey
    50	StartMeter
    60	ChangeClef
    70	Bar
    80	ChangeKey
    90	ChangeMeter
    95  GraceNotes ?
    100	Note
    */
    if (slot.clef) {
        res.xValue.clef = res.width;
        res.width += settings.defaultSpacing;
    }
    if (slot.key) {
        res.xValue.key = res.width;
        res.width += settings.defaultSpacing + slot.key.keyPositions.length * settings.keySigSpacing;
    }
    if (slot.meter) {
        res.xValue.meter = res.width;
        res.width += settings.defaultSpacing;
    }
    if (slot.bar) {
        res.xValue.bar = res.width;
        res.width += settings.afterBarSpacing;
    }
    if (slot.notes.length) {
        res.xValue.note = res.width;
        res.width += settings.defaultSpacing;
    }

    return res;
}


export function generateMeasureMap(staff: StaffViewModel, settings: Metrics): MeasureMapItem[] {
    let pos = settings.leftMargin;
    return staff.timeSlots.map(ts => {
        const spacing = { ...getTimeSlotSpacing(ts, settings), startPos: pos };
        pos += spacing.width;
        return spacing;
    });
}

export function lookupInMap(map: MeasureMapItem[], time: AbsoluteTime): MeasureMapXValueItem | undefined {
    let res = map.find(mp => Time.equals(mp.absTime, time));
    if (!res) return undefined;
    res = deepCloneMeasureMapItem(res);
    if (!res.startPos) res.startPos = 0;
    if (res.xValue.bar !== undefined) res.xValue.bar += res.startPos;
    if (res.xValue.clef !== undefined) res.xValue.clef += res.startPos;
    if (res.xValue.key !== undefined) res.xValue.key += res.startPos;
    if (res.xValue.meter !== undefined) res.xValue.meter += res.startPos;
    if (res.xValue.note !== undefined) res.xValue.note += res.startPos;
    return res.xValue;
}

function mergeXValues(item: MeasureMapItem, updateWith: MeasureMapItem, field: XValueKey): void {
    const f1 = updateWith.xValue[field];
    const f2 = item.xValue[field];
    if (f1 === undefined) {
        return;
    }
    if (f2 === undefined || f1 < f2) {
        item.xValue[field] = updateWith.xValue[field];
        return;
    }
}

function deepCloneMeasureMapItem(objectToClone: MeasureMapItem): MeasureMapItem {
    return {
        absTime: objectToClone.absTime,
        width: objectToClone.width,
        startPos: objectToClone.startPos,
        xValue: {...objectToClone.xValue }
    };
}


export function mergeMeasureMaps(measureMap1: MeasureMapItem[], measureMap2: MeasureMapItem[]): MeasureMapItem[] {
    const result = measureMap1.map(item => deepCloneMeasureMapItem(item));
    measureMap2.forEach(mapItem => {
        const existing = result.find((mi: MeasureMapItem) => Time.equals(mi.absTime, mapItem.absTime));
        if (existing) {
            mergeXValues(existing, mapItem, 'bar');
        } else {
            result.push(deepCloneMeasureMapItem(mapItem));
        }
    });
    
    result.sort((m1, m2) => Time.sortComparison(m1.absTime, m2.absTime));
    if (result.length) {
        if (result[0].startPos === undefined) result[0].startPos = 0;
        for (let i = 1; i < result.length; i++) {
            result[i].startPos = (result[i - 1].startPos as number) + result[i - 1].width;
        }
    }
    
    return result;
}