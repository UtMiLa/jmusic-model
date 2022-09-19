import { AbsoluteTime, Time } from './../../model/rationals/time';
import { VoiceDef } from './../../model/score/voice';
import { SequenceDef, TimeSlot } from './../../model/score/sequence';
import { keyToView, KeyViewModel } from './convert-key';
import { noteToView, NoteViewModel } from './note-view-model';
import { ClefType } from '../../model/states/clef';
import { Note, NoteDirection, NoteType } from '../../model/notes/note';
import { Clef } from '../../model/states/clef';
import { Sequence } from '../../model/score/sequence';
import { StaffDef } from '../../model/score/staff';
import { convertKey } from '../../physical-view/physical/physical-key';
import { Key } from '../../model/states/key';

export interface ClefViewModel {
    position: number;
    clefType: ClefType;
    line: number;
}

export interface TimeSlotViewModel {
    absTime: AbsoluteTime, 
    objects: (NoteViewModel | ClefViewModel | KeyViewModel)[];
}
export interface StaffViewModel {
    timeSlots: TimeSlotViewModel[]
}

export interface ScoreViewModel {
    staves: StaffViewModel[];
}

export function modelToViewModel(def: StaffDef): StaffViewModel {

    if (!def.voices) { 
        if (!def.seq) throw 'seq and voices undefined';

        def.voices = [{ content: def.seq }];
    }

    //const seq = def.voices.map(voice => new Sequence(voice.content));
    console.log('vc', def.voices);

    const clef = new Clef(def.initialClef);

    const timeSlots: TimeSlotViewModel[] = [
        {
            absTime: Time.newAbsolute(0,1),
            objects:    [
                { 
                    position: 1,
                    clefType: def.initialClef.clefType,
                    line: def.initialClef.line
                },
                keyToView(new Key(def.initialKey), new Clef(def.initialClef))
            ]
        
        }
    ];


    def.voices.forEach(voice => {
        const voiceTimeSlots = new Sequence(voice.content).groupByTimeSlots();

        voiceTimeSlots.forEach(voiceTimeSlot => {
            const slot = timeSlots.find(item => Time.equals(item.absTime, voiceTimeSlot.time));

            const elements = voiceTimeSlot.elements.map(note => {
                const noteClone = Note.clone(note, { direction: note.direction ? note.direction : voice.noteDirection });
                const noteView = noteToView(noteClone, clef);
                return noteView;
            });

            if (!slot) {
                timeSlots.push({ absTime: voiceTimeSlot.time, objects: elements });
            } else {
                slot.objects = slot.objects.concat(elements);
            }
        });
        
    });

    return { 
        timeSlots: timeSlots.sort((ts1, ts2) => Time.sortComparison(ts1.absTime, ts2.absTime))
    };


}

function voiceNotesToView(clef: Clef): (value: VoiceDef, index: number, array: VoiceDef[]) => NoteViewModel[] {
    return voice => (new Sequence(voice.content))
        .elements
        .map(elem => { 
            const noteClone = Note.clone(elem, { direction: elem.direction ? elem.direction : voice.noteDirection });
            const noteView = noteToView(noteClone, clef);
            return noteView;
        });
}
