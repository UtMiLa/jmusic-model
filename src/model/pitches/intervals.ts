import R = require('ramda');
import { Pitch, PitchClass } from './pitch';

export interface Interval {
    interval: number;
    alteration: number;
}

export function diffPitch(pitch1: Pitch, pitch2: Pitch): Interval {
    
    const interval = pitch1.diatonicNumber - pitch2.diatonicNumber;
    //const pureInterval = R.includes(R.mathMod(Math.abs(interval), 7), [0, 3, 4]);

    const diffPcs = pitch1.pitchClass.circleOf5Number - pitch2.pitchClass.circleOf5Number;
    
    const part1 = diffPcs > 1 ? Math.floor((diffPcs - 6) / 7) + 2 : 0;
    const part2 = diffPcs < -1 ? Math.floor((-diffPcs - 6) / 7) + 2 : 0;

    const alteration = part1 - part2;


    return { 
        interval, 
        alteration
    };
}

export function addInterval(pitch: Pitch, interval: Interval): Pitch {
    const pc = pitch.pitchClass;

    let alt = interval.alteration;

    if(alt){
        const baseInterval = interval.interval % 7;
        if (baseInterval === 0 || baseInterval === 3 || baseInterval === 4) {
            // pure/augm/dim
            if (alt < 0) alt++; else alt--;
        }
        else {
            if (alt > 0) alt--;
        }
    }


    const diffPc = [0, 2, 4, -1, 1, 3, 5][R.mathMod(interval.interval, 7)] + 7 * alt;
    const newpc = pc.circleOf5Number + diffPc;
    const newPitchClass = PitchClass.fromCircleOf5(newpc);
    const newAccidentals = newPitchClass.alteration;
    if (Number.isNaN(newAccidentals)) {
        // eslint-disable-next-line no-debugger
        debugger;
    }
    const octave = pitch.octave + Math.floor((pitch.pitchClassNumber + interval.interval) / 7);

    return new Pitch(newPitchClass.pitchClass, octave, newAccidentals);
}