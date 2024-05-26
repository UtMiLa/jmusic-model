import { AbsoluteTime, Time } from './../model/rationals/time';
import { Model } from './../model/model';
import { MusicEvent, getDuration } from './../model/score/sequence';
import { ElementIdentifier, Selection } from './selection-types';
import { EditableView } from '../model';


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

export function getTimeFromIdentifier(model: EditableView, element: ElementIdentifier): AbsoluteTime {
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
