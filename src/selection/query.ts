import { AbsoluteTime, Time } from './../model/rationals/time';
import { Model } from './../model/model';
import { MusicEvent, getDuration } from './../model/score/sequence';
import { ElementIdentifier, Selection } from './selection-types';




export class SelectionAll implements Selection {

    constructor() {
        //
    }

    isSelected(element: ElementIdentifier): boolean {
        return true; // element.staffNo === 1 && element.voiceNo === 0
    }

}


export function getTimeFromIdentifier(model: Model, element: ElementIdentifier): AbsoluteTime {
    const voice = model.staves[element.staffNo].voices[element.voiceNo];
    const elements = voice.content.elements.slice(0, element.elementNo);
    //console.log('getTimeFromIdentifier', voice, elements);
    return elements.reduce<AbsoluteTime>((sum: AbsoluteTime, element: MusicEvent) => Time.addTime(sum, getDuration(element)), Time.StartTime);
}


export class SelectionVoiceTime implements Selection {

    constructor(private model: Model, private staffNo: number, private voiceNo: number, private from: AbsoluteTime, private to: AbsoluteTime) {
        //
    }

    isSelected(element: ElementIdentifier): boolean {
        //console.log('isSelected', this, element);
        if (element.staffNo !== this.staffNo || element.voiceNo !== this.voiceNo) return false;
        const time = getTimeFromIdentifier(this.model, element);
        //console.log('isSelected time', time);
        if (Time.sortComparison(time, this.from) < 0 || Time.sortComparison(time, this.to) >= 0) return false;
        //console.log('isSelected true');
        return true;
    }

}
