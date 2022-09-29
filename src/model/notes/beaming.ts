import { Time } from './../rationals/time';
import { getAllBars, getAllBeats, Meter } from './../states/meter';
import { Sequence } from './../score/sequence';
import { Note } from './note';
export interface BeamGroup {
    notes: Note[];
}


export function calcBeamGroups(seq: Sequence, meter: Meter): BeamGroup[] {
    const meterIterator = getAllBeats(meter);
    let nextBeat = meterIterator.next().value;
    const grouping: BeamGroup[] = [];
    let tempGroup: Note[] = [];
    let time = Time.newAbsolute(0, 1);

    seq.elements.forEach(note => {
        if (Time.sortComparison(time, nextBeat) >= 0) {
            // new beat
            //console.log('new beat', time, nextBeat, tempGroup);
            
            grouping.push({ notes: tempGroup });
            tempGroup = [];
            nextBeat = meterIterator.next().value;
        }
        tempGroup.push(note);
        time = Time.addTime(time, note.duration);
    });

    if (tempGroup.length) grouping.push({ notes: tempGroup });
    //console.log('tempGroup', time, tempGroup);

    return grouping;
}