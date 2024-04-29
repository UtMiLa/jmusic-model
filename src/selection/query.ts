import { Model } from './../model/model';
import { MusicEvent } from './../model/score/sequence';
import { ElementIdentifier, Selection } from './selection-types';




export class SelectionAll implements Selection {

    constructor() {
        //
    }

    isSelected(element: ElementIdentifier): boolean {
        return true; // element.staffNo === 1 && element.voiceNo === 0
    }

}