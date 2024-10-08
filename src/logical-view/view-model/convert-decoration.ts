import { NoteDirection } from './../../model/data-only/notes';
import { LongDecorationElement, LongDecorationType } from './../../model/data-only/decorations';
import { setNoteDirection } from './../../model/notes/note';
import { TimeSlot } from './../../model/score/sequence';
import { Time, AbsoluteTime } from './../../model/rationals/time';
import { NoteRef } from './note-view-model';

export interface LongDecorationViewModel {
    noteRefs: NoteRef[];
    type: LongDecorationType;
    direction?: NoteDirection;
}


export function LongDecoToView(longDeco: LongDecorationElement, fromTime: AbsoluteTime, timeSlot: TimeSlot[]): LongDecorationViewModel {
    
    const toTime = Time.addTime(fromTime, longDeco.length);
    const note1 = timeSlot.find(t => Time.equals(t.time, fromTime));
    const note2 = timeSlot.find(t => Time.equals(t.time, toTime));

    if (!note1 || !note2) throw 'Cannot find note (LongDecoToView)';
    if (!note1.elements.length || !note2.elements.length) throw 'No note at time (LongDecoToView)'; // should not come here

    return {
        type: longDeco.longDeco,
        noteRefs: [
            { uniq: note1.elements[0].uniq as string, absTime: fromTime },
            { uniq: note2.elements[0].uniq as string, absTime: Time.addTime(fromTime, longDeco.length) }
        ]
        //,        direction: note1.elements[0].direction
    };
}