import { SequenceDef } from '../data-only/voices';
import { AbsoluteTime, Time, TimeSpan } from '../rationals/time';
import { BaseSequence, MusicEvent, getDuration } from '../score/sequence';
import { activeGetElements, convertActiveSequenceToData, convertSequenceDataToActive } from './conversions';
import { ActiveSequence } from './types';


export class SimpleActiveSequence extends BaseSequence {
    constructor(private seq: ActiveSequence) {
        super();

        //this.asObject = def;
    }

    public get asObject(): SequenceDef {
        return convertActiveSequenceToData(this.seq) as SequenceDef; // todo: fix the cast
    }
    public set asObject(value: SequenceDef) {
        this.seq = convertSequenceDataToActive(value, {});
        //this._elements = value ? splitByNotes(value).map(str => parseLilyElement(str)) : [];
    }

    
    public get elements(): MusicEvent[] {
        return activeGetElements(this.seq);
    }

    /*public addElement(element: MusicEvent): void {
        throw 'Not implemented';
    }*/

    public insertElements(time: AbsoluteTime, element: MusicEvent[]): void {
        throw 'Not implemented';
    }

    get count(): number {
        return this.elements.length;
    }

    get duration(): TimeSpan {
        return this.elements.reduce((prev, curr) => Time.addSpans(prev, getDuration(curr)), Time.newSpan(0, 1));
    }

}
