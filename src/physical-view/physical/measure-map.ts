import { AbsoluteTime, Time } from './../../model';

import { Metrics } from './metrics';
import { ScoreViewModel, StaffViewModel, TimeSlotViewModel } from './../../logical-view';
import { yToStaffLine } from './functions';

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
    offsets: MeasureMapXValueItem;
}

export interface LocalizedObject {
    time: AbsoluteTime;
    staff: number;
    item: string;
    pitch: number;
}

export function generateMeasureMap(viewModel: ScoreViewModel, settings: Metrics): MeasureMap {
    let measureMap = new MeasureMap();
    viewModel.staves.forEach((staffModel: StaffViewModel) => {
        const measureMapX = MeasureMap.generate(staffModel, settings);
        measureMap = measureMap.mergeWith(measureMapX);
    });
    return measureMap;
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

        const result = this.calcOffsets(res);

        return result;
    }


    private calcOffsets(res: MeasureMapItem) {
        const result = {} as MeasureMapXValueItem;
        if (!res.startPos) res.startPos = 0;

        let pos = res.startPos;
        if (res.widths.bar) {
            result.bar = pos + res.offsets.bar;
            pos += res.widths.bar;
        }

        if (res.widths.clef) {
            result.clef = pos + res.offsets.clef;
            pos += res.widths.clef;
        }

        if (res.widths.key) {
            result.key = pos + res.offsets.key;
            pos += res.widths.key;
        }
        if (res.widths.meter) {
            result.meter = pos + res.offsets.meter;
            pos += res.widths.meter;
        }

        if (res.widths.accidentals) {
            result.accidentals = pos + res.offsets.accidentals;
            pos += res.widths.accidentals;
        }

        if (res.widths.note) {
            result.note = pos + res.offsets.note;
            pos += res.widths.note;
        }
        return result;
    }

    mergeWidths(item: MeasureMapItem, updateWith: MeasureMapItem, field: XValueKey): void {
        const f1 = updateWith.widths[field];
        const f2 = item.widths[field];
        const p1 = updateWith.offsets[field];
        const p2 = item.offsets[field];

        if (f1 === undefined) {
            return;
        }
        if (f2 === undefined || f1 > f2) {
            item.widths[field] = updateWith.widths[field];
            item.offsets[field] = updateWith.offsets[field]; // todo: in rare circumstances offset is smaller for the wider object
            return;
        }
    }    
    
    localize(x: number, y: number, settings: Metrics): LocalizedObject | undefined {
        const mapItem = this.measureMap.find(mi => mi.startPos && mi.startPos + mi.width > x);
        if (!mapItem) {
            return undefined;
        }
        const offsetItem = this.calcOffsets(mapItem);
        //const diff = x - (mapItem.startPos as number);
        //let itemType: XValueKey | undefined = undefined;


        const setItemType = (field: XValueKey): XValueKey | undefined => {
            if (mapItem.widths[field] && x >= offsetItem[field] && x < offsetItem[field] + mapItem.widths[field]) { return field; }    
        };

        /*if (mapItem.widths.clef && diff >= offsetItem.clef && diff < offsetItem.clef + mapItem.widths.clef) {itemType = 'clef';}
        if (mapItem.widths.key && diff >= offsetItem.key && diff < offsetItem.key + mapItem.widths.key) {itemType = 'key';}*/

        const itemType = setItemType('clef')
        || setItemType('key')
        || setItemType('meter')
        || setItemType('accidentals')
        || setItemType('bar')
        || setItemType('note');

        const staffSpacing = settings.staffBottomMargin + settings.staffTopMargin + /*(settings.scaleDegreeUnit **/ 110;
        //const noteSpacing = settings.staffBottomMargin + settings.staffTopMargin;
        const staff = Math.trunc(y / staffSpacing);
        
        if (!itemType) return undefined;

        return {
            time: mapItem?.absTime,
            staff,
            item: itemType,
            pitch: Math.trunc(yToStaffLine(y - staffSpacing * staff, settings))
        };
    }

    totalWidth(): number {
        let width = 0;
        this.measureMap.forEach(mm => width += mm.width);
        return width;
    }
}

export function getTimeSlotWidth(slot: TimeSlotViewModel, settings: Metrics): number {
    return getTimeSlotSpacing(slot, settings).width;
}


export function getTimeSlotSpacing(slot: TimeSlotViewModel, settings: Metrics): MeasureMapItem {
    const res: MeasureMapItem = { absTime: slot.absTime, width: 0, widths: {} as MeasureMapXValueItem, offsets: {} as MeasureMapXValueItem };
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
        res.widths.clef = settings.defaultSpacing;
        res.offsets.clef = 0;
        res.width += res.widths.clef;
    }
    if (slot.key) {
        res.widths.key = settings.defaultSpacing + slot.key.keyPositions.length * settings.keySigSpacing;
        res.offsets.key = 0;
        res.width += res.widths.key;
    }
    if (slot.meter) {
        res.widths.meter = settings.defaultSpacing;
        res.offsets.meter = 0;
        res.width += res.widths.meter;
    }
    if (slot.bar) {
        res.widths.bar = settings.afterBarSpacing;
        res.offsets.bar = 0;
        res.width += res.widths.bar;
    }
    if (slot.accidentals) {
        const maxDisplacement = slot.accidentals.reduce((prev, curr) => prev > curr.displacement ? curr.displacement : prev, 0);
        res.widths.accidentals = settings.accidentalSpacing - maxDisplacement * settings.accidentalDisplacement;
        res.offsets.accidentals = - maxDisplacement * settings.accidentalDisplacement;
        res.width += res.widths.accidentals;
    }
    if (slot.notes.length) { 
        // todo: notes can have different position in same staff.
        // todo: calculate left and right displacement, and an offset and width from that
        res.widths.note = settings.defaultSpacing;
        res.offsets.note = 0;
        res.width += res.widths.note;
    }

    return res;
}



function deepCloneMeasureMapItem(objectToClone: MeasureMapItem): MeasureMapItem {
    return {
        absTime: objectToClone.absTime,
        width: objectToClone.width,
        startPos: objectToClone.startPos,
        widths: {...objectToClone.widths },
        offsets: { ...objectToClone.offsets }
    };
}


