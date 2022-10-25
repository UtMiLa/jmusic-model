import { Rational, RationalDef } from '../../model/rationals/rational';
import { Note } from '../notes/note';
import { TimeSpan } from '../rationals/time';
import { StateChange } from '../states/state';
import { BaseSequence, ISequence, TimeSlot } from './sequence';


export class RetrogradeSequence extends BaseSequence {
    constructor(private sequence: ISequence) {
        super();
    }
    
    public get elements(): (Note | StateChange)[] {
        return [...this.sequence.elements].reverse();
    }
    
    public get duration(): TimeSpan {
        return this.sequence.duration;
    }
}



export class TupletSequence extends BaseSequence {
    constructor(private sequence: ISequence, private fraction: RationalDef) {
        super();
    }
    
    public get elements(): (Note | StateChange)[] {
        return this.sequence.elements.map((ele, index) => {
            if ((ele as StateChange).isState) {
                return ele;
            } else {
                return Note.clone(ele as Note, { tupletFactor : this.fraction });
            }
        });
    }
    
    public get duration(): TimeSpan {
        return {...Rational.multiply(this.fraction, this.sequence.duration), type: 'span' };
    }

    public groupByTimeSlots(keyPrefix: string): TimeSlot[] {
        const res = super.groupByTimeSlots(keyPrefix);

        res[0].elements[0].tupletGroup = res.map(slot => slot.elements[0].uniq + '');
        
        return res;
    }
}
