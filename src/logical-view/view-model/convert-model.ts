import { AccidentalManager } from './../../model/states/key';
import { Alternation } from './../../model/pitches/pitch';
import { getAllBars, ScoreDef } from './../../model';
import { MeterFactory } from './../../model';
import { meterToView, MeterViewModel } from './convert-meter';
import { AbsoluteTime, Time } from './../../model';
import { keyToView, KeyViewModel } from './convert-key';
import { noteToView, NoteViewModel } from './note-view-model';
import { ClefType } from '../../model';
import { Note, NoteDirection } from '../../model';
import { Clef } from '../../model';
import { Sequence } from '../../model';
import { StaffDef } from '../../model';
import { Key } from '../../model';

export interface ClefViewModel {
    position: number;
    clefType: ClefType;
    line: number;
}

export interface TieViewModel { 
    position: number; 
    direction: NoteDirection;
    toTime?: AbsoluteTime;
}

export interface AccidentalViewModel {
    position: number;
    alternation: Alternation;
    displacement: number;
}
export interface TimeSlotViewModel {
    absTime: AbsoluteTime; 
    clef?: ClefViewModel;
    key?: KeyViewModel;
    meter?: MeterViewModel;
    bar?: boolean;
    ties?: TieViewModel[];
    accidentals?: AccidentalViewModel[];
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

export function scoreModelToViewModel(def: ScoreDef): ScoreViewModel {
    return { staves: def.staves.map(staff => staffModelToViewModel(staff)) };
}

export function staffModelToViewModel(def: StaffDef): StaffViewModel {

    if (!def.voices) { 
        if (!def.seq) throw 'seq and voices undefined';

        def.voices = [{ content: def.seq }];
    }

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

    let nextBarIterator: IterableIterator<AbsoluteTime>;
    let nextBar = Time.newAbsolute(1, 0);

    if(meterModel) {
        timeSlots[0].meter = meter;
        nextBarIterator = getAllBars(meterModel);
        nextBar = nextBarIterator.next().value;
    }

    let staffEndTime = Time.newAbsolute(0, 1);

    def.voices.forEach(voice => {        
        const voiceSequence = new Sequence(voice.content);
        const voiceTimeSlots = voiceSequence.groupByTimeSlots();
        const voiceEndTime = Time.fromStart(voiceSequence.duration);

        if (Time.sortComparison(voiceEndTime, staffEndTime) > 0) {
            staffEndTime = voiceEndTime;
        }

        const accidentalManager = new AccidentalManager();
        if (def.initialKey) accidentalManager.setKey(new Key(def.initialKey));

        voiceTimeSlots.forEach(voiceTimeSlot => {
            const slot = getTimeSlot(timeSlots, voiceTimeSlot.time);
            //timeSlots.find(item => Time.equals(item.absTime, voiceTimeSlot.time));
            
            if (nextBarIterator && Time.sortComparison(slot.absTime, nextBar) >= 0) {
                accidentalManager.newBar();
                nextBar = nextBarIterator.next().value;
            }

            const elements = voiceTimeSlot.elements.map(note => {
                const noteClone = Note.clone(note, { direction: note.direction ? note.direction : voice.noteDirection });
                const noteView = noteToView(noteClone, clef);
                return noteView;
            });

            const accidentals: AccidentalViewModel[] = [];
            
            voiceTimeSlot.elements.forEach(note => 
                note.pitches.forEach(pitch => {
                    const alt = accidentalManager.getAccidental(pitch);
                    if (alt !== undefined)
                        accidentals.push({ alternation: alt, position: clef.map(pitch), displacement: 0 });
                })
            );

            if (accidentals.length) {
                if (slot.accidentals) { 
                    slot.accidentals = slot.accidentals.concat(accidentals);
                } else {
                    slot.accidentals = accidentals;
                }                
            }

            slot.notes = slot.notes.concat(elements);

            const ties = [] as TieViewModel[];
            voiceTimeSlot.elements.forEach(note => {
                if (note.tie) {
                    //console.log('note tie', note);
                    
                    note.pitches.map(p => clef.map(p)).sort().forEach(pos => {
                        //console.log('adding ties', pos);
                        ties.push({ 
                            position: pos,
                            direction: note.direction === NoteDirection.Undefined ? voice.noteDirection : note.direction,
                            toTime: Time.addTime(voiceTimeSlot.time, note.duration)
                        } as TieViewModel);
                    });
                }
            });

            if (ties.length) {
                //console.log('setting ties', ties);
                slot.ties = slot.ties ? slot.ties.concat(ties) : ties;
            }
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
            //console.log('bar adding', slot, barTime);
        }
    }
    return { 
        timeSlots: timeSlots.sort((ts1, ts2) => Time.sortComparison(ts1.absTime, ts2.absTime))
    };


}
