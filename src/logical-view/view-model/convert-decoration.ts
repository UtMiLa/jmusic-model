import { TimeSlot } from './../../model/score/sequence';
import { Time, AbsoluteTime } from './../../model/rationals/time';
import { NoteRef } from './note-view-model';
import { LongDecorationElement, LongDecorationType } from './../../model/decorations/decoration-type';

export interface LongDecorationView {
    noteRefs: NoteRef[];
    type: LongDecorationType;
}


export function LongDecoToView(longDeco: LongDecorationElement, fromTime: AbsoluteTime, timeSlot: TimeSlot[]): LongDecorationView {
    
    const toTime = Time.addTime(fromTime, longDeco.length);
    const note1 = timeSlot.find(t => Time.equals(t.time, fromTime));
    const note2 = timeSlot.find(t => Time.equals(t.time, toTime));

    if (!note1 || !note2) throw 'Cannot find note (LongDecoToView)';
    if (!note1.elements.length || !note2.elements.length) throw 'No note at time (LongDecoToView)';

    return {
        type: longDeco.longDeco,
        noteRefs: [
            { uniq: note1.elements[0].uniq as string, absTime: fromTime },
            { uniq: note2.elements[0].uniq as string, absTime: Time.addTime(fromTime, longDeco.length) }
        ] 
    };
}