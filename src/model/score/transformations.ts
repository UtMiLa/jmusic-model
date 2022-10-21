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
        return this.sequence.elements.map(ele => {
            if ((ele as StateChange).isState) {
                return ele;
            } else {
                return Note.clone(ele as Note, { tupletFactor : this.fraction });
            }
        });
    }
    
    public get duration(): TimeSpan {
        return this.sequence.duration;
    }
}
