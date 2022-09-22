import { MeterFactory } from './../../model/states/meter';
import { meterToView, MeterViewModel } from './convert-meter';
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
import { convertMeter } from '../../physical-view/physical/physical-meter';

export interface ClefViewModel {
    position: number;
    clefType: ClefType;
    line: number;
}

export interface TimeSlotViewModel {
    absTime: AbsoluteTime, 
    clef?: ClefViewModel,
    key?: KeyViewModel,
    meter?: MeterViewModel,
    bar?: boolean,
    notes: NoteViewModel[];
}
export interface StaffViewModel {
    timeSlots: TimeSlotViewModel[]
}

export interface ScoreViewModel {
    staves: StaffViewModel[];
}

function getTimeSlot(timeSlots: TimeSlotViewModel[], time: AbsoluteTime): TimeSlotViewModel {
    const slot = timeSlots.find(item => Time.equals(item.absTime, time));
    if (slot) return slot;
    const res = {
        absTime: time,
        notes: []
    } as TimeSlotViewModel;
    timeSlots.push(res);
    return res;
}

export function modelToViewModel(def: StaffDef): StaffViewModel {

    if (!def.voices) { 
        if (!def.seq) throw 'seq and voices undefined';

        def.voices = [{ content: def.seq }];
    }

    //const seq = def.voices.map(voice => new Sequence(voice.content));
    //console.log('vc', def.voices);

    const clef = new Clef(def.initialClef);

    const meterModel = def.initialMeter ? MeterFactory.createRegularMeter(def.initialMeter) : undefined;
    const meter = meterModel ? meterToView(meterModel) : undefined;

    const timeSlots: TimeSlotViewModel[] = [
        {
            absTime: Time.newAbsolute(0,1),
            notes: [],
            clef: { 
                position: 1,
                clefType: def.initialClef.clefType,
                line: def.initialClef.line
            },
            
            key: keyToView(new Key(def.initialKey), new Clef(def.initialClef))           
        
        }
    ];

    if(meter) {
        timeSlots[0].meter = meter;
    }

    let staffEndTime = Time.newAbsolute(0, 1);

    def.voices.forEach(voice => {
        const voiceSequence = new Sequence(voice.content);
        const voiceTimeSlots = voiceSequence.groupByTimeSlots();
        const voiceEndTime = Time.fromStart(voiceSequence.duration);

        if (Time.sortComparison(voiceEndTime, staffEndTime) > 0) {
            staffEndTime = voiceEndTime;
        }

        voiceTimeSlots.forEach(voiceTimeSlot => {
            const slot = getTimeSlot(timeSlots, voiceTimeSlot.time);
            //timeSlots.find(item => Time.equals(item.absTime, voiceTimeSlot.time));

            const elements = voiceTimeSlot.elements.map(note => {
                const noteClone = Note.clone(note, { direction: note.direction ? note.direction : voice.noteDirection });
                const noteView = noteToView(noteClone, clef);
                return noteView;
            });

            slot.notes = slot.notes.concat(elements);            
        });
        
    });

    if (meterModel) {
        const measureTime = meterModel.measureLength;
        let barTime = meterModel.firstBarTime;
        //console.log('bar', measureTime, barTime, staffEndTime, meterModel);
        
        while (Time.sortComparison(barTime, staffEndTime) <= 0) {
            const slot = getTimeSlot(timeSlots, barTime);
            slot.bar = true;
            barTime = Time.addTime(barTime, measureTime);
            console.log('bar adding', slot, barTime);
        }
    }
    return { 
        timeSlots: timeSlots.sort((ts1, ts2) => Time.sortComparison(ts1.absTime, ts2.absTime))
    };


}

/*function voiceNotesToView(clef: Clef): (value: VoiceDef, index: number, array: VoiceDef[]) => NoteViewModel[] {
    return voice => (new Sequence(voice.content))
        .elements
        .map(elem => { 
            const noteClone = Note.clone(elem, { direction: elem.direction ? elem.direction : voice.noteDirection });
            const noteView = noteToView(noteClone, clef);
            return noteView;
        });
}
*/