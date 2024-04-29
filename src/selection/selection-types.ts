import { Model } from './../model/model';
import { MusicEvent } from './../model/score/sequence';


export interface ElementIdentifier {
    staffNo: number;
    voiceNo: number;
    elementNo: number;
}

export interface Selection {
    isSelected(element: ElementIdentifier): boolean;
}
