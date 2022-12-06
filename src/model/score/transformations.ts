import { AbsoluteTime } from './../rationals/time';
import { Rational, RationalDef } from '../../model/rationals/rational';
import { Note, TupletState } from '../notes/note';
import { TimeSpan } from '../rationals/time';
import { StateChange } from '../states/state';
import { BaseSequence, ISequence, MusicEvent, TimeSlot } from './sequence';


export class RetrogradeSequence extends BaseSequence {
    constructor(private sequence: ISequence) {
        super();
    }
    
    public get elements(): MusicEvent[] {
        const res = this.sequence.elements.map(n => {
            if ((n as StateChange).isState) return n;
            const note = Note.clone(n as Note);
            if ((note as Note).tupletGroup === TupletState.Begin) {
                (note as Note).tupletGroup = TupletState.End;
            } else if ((note as Note).tupletGroup === TupletState.End) {
                (note as Note).tupletGroup = TupletState.Begin;
            }
            return note;
        }).reverse();
        return res;
    }
    
    public insertElement(time: AbsoluteTime, element: MusicEvent): void {
        throw 'RetrogradeSequence does not support insertElement';
    }

    public get duration(): TimeSpan {
        return this.sequence.duration;
    }
}



export class TupletSequence extends BaseSequence {
    constructor(private sequence: ISequence, private fraction: RationalDef) {
        super();
    }
    
    public get elements(): MusicEvent[] {
        return this.sequence.elements.map((ele, i, arr) => {
            if ((ele as StateChange).isState) {
                return ele;
            } else {
                const tupletGroup = i ? (i === arr.length - 1 ? TupletState.End : TupletState.Inside) : TupletState.Begin;
                return Note.clone(ele as Note, { tupletFactor : this.fraction, tupletGroup });
            }
        });
    }

    public insertElement(time: AbsoluteTime, element: MusicEvent): void {
        throw 'TupletSequence does not support insertElement';
    }
    
    public get duration(): TimeSpan {
        return {...Rational.multiply(this.fraction, this.sequence.duration), type: 'span' };
    }

    /*public groupByTimeSlots(keyPrefix: string): TimeSlot[] {
        const res = super.groupByTimeSlots(keyPrefix);

        res.forEach((ts, i) => ts.elements[0].tupletGroup = i ? (i === res.length - 1 ? TupletState.End : TupletState.Inside) : TupletState.Begin );
        //res[0].elements[0]; //res.map(slot => slot.elements[0].uniq + '');
        
        return res;
    }*/
}
