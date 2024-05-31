import { AbsoluteTime, Time } from './../model/rationals/time';
import { MusicEvent, getDuration } from './../model/score/sequence';
import { ElementIdentifier, Selection } from './selection-types';
import { EditableView, Staff } from '../model';
import { InsertionPoint } from '../editor/insertion-point';


export type ElementPredicate = (element: ElementIdentifier) => boolean;

export class SelectionBy implements Selection{
    constructor(private predicate: ElementPredicate) {}

    isSelected(element: ElementIdentifier): boolean {
        return this.predicate(element);
    }
}

export class SelectionAll extends SelectionBy {
    constructor() {
        super(() => true);
    }
}

export function getTimeFromIdentifier(model: { staves: Staff[] }, element: ElementIdentifier): AbsoluteTime {
    const voice = model.staves[element.staffNo].voices[element.voiceNo];
    const elements = voice.content.elements.slice(0, element.elementNo);
    return elements.reduce<AbsoluteTime>((sum: AbsoluteTime, element: MusicEvent) => Time.addTime(sum, getDuration(element)), Time.StartTime);
}


export class SelectionVoiceTime extends SelectionBy {

    constructor(private model: EditableView, private staffNo: number, private voiceNo: number, private from: AbsoluteTime, private to: AbsoluteTime) {
        //
        super((element: ElementIdentifier): boolean => {
            //console.log('isSelected', this, element);
            if (element.staffNo !== this.staffNo || element.voiceNo !== this.voiceNo) return false;
            const time = getTimeFromIdentifier(this.model, element);
            //console.log('isSelected time', time);
            if (Time.sortComparison(time, this.from) < 0 || Time.sortComparison(time, this.to) >= 0) return false;
            //console.log('isSelected true');
            return true;
        });
    }

}


export class SelectionInsertionPoint extends SelectionBy {
    constructor(private insertionPoint: InsertionPoint) {
        super((element: ElementIdentifier) => {
            if (element.staffNo !== this.insertionPoint.staffNo || element.voiceNo !== this.insertionPoint.voiceNo) return false;
            const time = getTimeFromIdentifier(this.insertionPoint.score, element);
            //console.log('isSelected time', time);
            if (Time.sortComparison(time, this.insertionPoint.time) !== 0) return false;
            //console.log('isSelected true');
            return true;

        });
    }
}