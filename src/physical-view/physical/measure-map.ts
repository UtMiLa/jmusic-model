import { AbsoluteTime, Time } from './../../model/rationals/time';

import { Metrics } from './metrics';
import { StaffViewModel, TimeSlotViewModel } from './../../logical-view/view-model/convert-model';

export interface MeasureMapXValueItem {
    key?: number;
    clef?: number;
    bar?: number;
    meter?: number;
    note?: number;
}

export interface MeasureMapItem {
    absTime: AbsoluteTime;
    width: number;
    startPos?: number;
    xValue: MeasureMapXValueItem;
}

export function getTimeSlotWidth(slot: TimeSlotViewModel, settings: Metrics): number {
    /*let res = 0;

    if (slot.bar) {
        res += settings.afterBarSpacing;
    }
    if (slot.clef) {
        res += settings.defaultSpacing;
    }
    if (slot.meter) {
        res += settings.defaultSpacing;
    }
    if (slot.key) {
        res += settings.defaultSpacing + slot.key.keyPositions.length * settings.keySigSpacing;
    }
    if (slot.notes.length) {
        res += settings.defaultSpacing;
    }*/

    return getTimeSlotSpacing(slot, settings).width;
    //res;
}


export function getTimeSlotSpacing(slot: TimeSlotViewModel, settings: Metrics): MeasureMapItem {
    const res: MeasureMapItem = { absTime: slot.absTime, width: 0, xValue: {} };
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
    const res = map.find(mp => Time.equals(mp.absTime, time));
    if (!res) return undefined;
    if (!res.startPos) res.startPos = 0;
    if (res.xValue.bar !== undefined) res.xValue.bar += res.startPos;
    if (res.xValue.clef !== undefined) res.xValue.clef += res.startPos;
    if (res.xValue.key !== undefined) res.xValue.key += res.startPos;
    if (res.xValue.meter !== undefined) res.xValue.meter += res.startPos;
    if (res.xValue.note !== undefined) res.xValue.note += res.startPos;
    return res.xValue;
}