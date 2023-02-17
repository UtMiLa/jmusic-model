import { AbsoluteTime, Time } from './../rationals/time';
import { Rational, RationalDef } from '../../model/rationals/rational';
import { Note, setGrace, setTupletFactor, setTupletGroup, TupletState } from '../notes/note';
import { TimeSpan } from '../rationals/time';
import { isLongDecoration, isStateChange, BaseSequence, ISequence, MusicEvent, TimeSlot } from './sequence';


export class RetrogradeSequence extends BaseSequence {
    constructor(private sequence: ISequence) {
        super();
    }
    
    public get elements(): MusicEvent[] {
        const res = this.sequence.elements.map(n => {
            if (isStateChange(n)) return n;
            if (isLongDecoration(n)) return n;
            let tupletGroup;
            if ((n as Note).tupletGroup === TupletState.Begin) {
                tupletGroup = TupletState.End;
            } else if ((n as Note).tupletGroup === TupletState.End) {
                tupletGroup = TupletState.Begin;
            }
            const note = tupletGroup ? setTupletGroup(n, tupletGroup) : n;
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
            if (isStateChange(ele) || isLongDecoration(ele)) {
                return ele;
            } else {
                const tupletGroup = i ? (i === arr.length - 1 ? TupletState.End : TupletState.Inside) : TupletState.Begin;
                return setTupletGroup(setTupletFactor(ele, this.fraction), tupletGroup);
            }
        });
    }

    public insertElement(time: AbsoluteTime, element: MusicEvent): void {
        throw 'TupletSequence does not support insertElement';
    }
    
    public get duration(): TimeSpan {
        return {...Rational.multiply(this.fraction, this.sequence.duration), type: 'span' };
    }
}

export class GraceSequence extends BaseSequence {
    constructor(private sequence: ISequence) {
        super();
    }
    
    public get elements(): MusicEvent[] {
        return this.sequence.elements.map((ele, i, arr) => {
            if (isStateChange(ele) || isLongDecoration(ele)) {
                return ele;
            } else {
                //const graceGroup = i ? (i === arr.length - 1 ? TupletState.End : TupletState.Inside) : TupletState.Begin;
                return setGrace(ele, true);
            }
        });
    }

    public insertElement(time: AbsoluteTime, element: MusicEvent): void {
        throw 'TupletSequence does not support insertElement';
    }
    
    public get duration(): TimeSpan {
        return Time.NoTime;
    }
}
