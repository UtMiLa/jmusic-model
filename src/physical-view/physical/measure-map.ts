import { AbsoluteTime, Time } from './../../model';

import { Metrics } from './metrics';
import { StaffViewModel, TimeSlotViewModel } from './../../logical-view';

export type MeasureMapXValueItem = {
    [index in XValueKey]: number;
};

export type XValueKey = 'bar' | 'clef' | 'key' | 'note' | 'meter' | 'accidentals';

export interface MeasureMapItem {
    absTime: AbsoluteTime;
    width: number;
    startPos?: number;
    //xValue: MeasureMapXValueItem;
    widths: MeasureMapXValueItem;
}



export class MeasureMap {
    constructor(public measureMap: MeasureMapItem[] = []) {
    }


    static generate(staff: StaffViewModel, settings: Metrics): MeasureMap {
        let pos = settings.leftMargin;
        return new MeasureMap(staff.timeSlots.map(ts => {
            const spacing = { ...getTimeSlotSpacing(ts, settings), startPos: pos };
            pos += spacing.width;
            return spacing;
        }));
    }

    mergeWith(measureMap2: MeasureMap): MeasureMap {
        const result = this.measureMap.map(item => deepCloneMeasureMapItem(item));
        measureMap2.measureMap.forEach(mapItem => {
            const existing = result.find((mi: MeasureMapItem) => Time.equals(mi.absTime, mapItem.absTime));
            if (existing) {
                this.mergeWidths(existing, mapItem, 'bar');
                this.mergeWidths(existing, mapItem, 'clef');
                this.mergeWidths(existing, mapItem, 'key');
                this.mergeWidths(existing, mapItem, 'meter');
                this.mergeWidths(existing, mapItem, 'accidentals');
                this.mergeWidths(existing, mapItem, 'note');
                if (existing.width < mapItem.width) {
                    existing.width = mapItem.width;
                }
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
        
        return new MeasureMap(result);
    }


    lookup(time: AbsoluteTime): MeasureMapXValueItem | undefined {
        const map = this.measureMap;
        const res = map.find(mp => Time.equals(mp.absTime, time));
        if (!res) return undefined;
        /*res = deepCloneMeasureMapItem(res);*/
        if (!res.startPos) res.startPos = 0;
        /*if (res.xValue.bar !== undefined) res.xValue.bar += res.startPos;
        if (res.xValue.clef !== undefined) res.xValue.clef += res.startPos;
        if (res.xValue.key !== undefined) res.xValue.key += res.startPos;
        if (res.xValue.meter !== undefined) res.xValue.meter += res.startPos;
        if (res.xValue.accidentals !== undefined) res.xValue.accidentals += res.startPos;
        if (res.xValue.note !== undefined) res.xValue.note += res.startPos;
        return res.xValue;*/

        const result = {} as MeasureMapXValueItem; 
        let pos = res.startPos;
        if (res.widths.bar) {
            result.bar = pos;
            pos += res.widths.bar;
        }

        if (res.widths.clef) {
            result.clef = pos;
            pos += res.widths.clef;
        }

        if (res.widths.key) {
            result.key = pos;
            pos += res.widths.key;
        }
        if (res.widths.meter) {
            result.meter = pos;
            pos += res.widths.meter;
        }

        if (res.widths.accidentals) {
            result.accidentals = pos;
            pos += res.widths.accidentals;
        }

        if (res.widths.note) {
            result.note = pos;
            pos += res.widths.note;
        }

        return result;
    }
    
    /*mergeXValues(item: MeasureMapItem, updateWith: MeasureMapItem, field: XValueKey): void {
        const f1 = updateWith.xValue[field];
        const f2 = item.xValue[field];
        if (f1 === undefined) {
            return;
        }
        if (f2 === undefined || f1 < f2) {
            item.xValue[field] = updateWith.xValue[field];
            return;
        }
    } */   

    mergeWidths(item: MeasureMapItem, updateWith: MeasureMapItem, field: XValueKey): void {
        const f1 = updateWith.widths[field];
        const f2 = item.widths[field];
        if (f1 === undefined) {
            return;
        }
        if (f2 === undefined || f1 > f2) {
            item.widths[field] = updateWith.widths[field];
            return;
        }
    }    
    

}


export function getTimeSlotWidth(slot: TimeSlotViewModel, settings: Metrics): number {
    return getTimeSlotSpacing(slot, settings).width;
    //res;
}


export function getTimeSlotSpacing(slot: TimeSlotViewModel, settings: Metrics): MeasureMapItem {
    const res: MeasureMapItem = { absTime: slot.absTime, width: 0, /*xValue: {} as MeasureMapXValueItem,*/ widths: {} as MeasureMapXValueItem };
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
        //res.xValue.clef = res.width;
        res.widths.clef = settings.defaultSpacing;
        res.width += settings.defaultSpacing;
    }
    if (slot.key) {
        //res.xValue.key = res.width;
        res.widths.key = settings.defaultSpacing + slot.key.keyPositions.length * settings.keySigSpacing;
        res.width += settings.defaultSpacing + slot.key.keyPositions.length * settings.keySigSpacing;
    }
    if (slot.meter) {
        //res.xValue.meter = res.width;
        res.widths.meter = settings.defaultSpacing;
        res.width += settings.defaultSpacing;
    }
    if (slot.bar) {
        //res.xValue.bar = res.width;
        res.widths.bar = settings.afterBarSpacing;
        res.width += settings.afterBarSpacing;
    }
    if (slot.accidentals) {
        //res.xValue.accidentals = res.width;
        res.widths.accidentals = settings.accidentalSpacing;
        res.width += settings.accidentalSpacing;
    }
    if (slot.notes.length) {
        //res.xValue.note = res.width;
        res.widths.note = settings.defaultSpacing;
        res.width += settings.defaultSpacing;
    }

    return res;
}



function deepCloneMeasureMapItem(objectToClone: MeasureMapItem): MeasureMapItem {
    return {
        absTime: objectToClone.absTime,
        width: objectToClone.width,
        startPos: objectToClone.startPos,
        //xValue: {...objectToClone.xValue },
        widths: {...objectToClone.widths }
    };
}


