import { BeamingViewModel } from './beaming-view-model';
import { AccidentalManager, displaceAccidentals } from './../../model/states/key';
import { Alternation } from './../../model/pitches/pitch';
import { getAllBars, ScoreDef } from './../../model';
import { MeterFactory } from './../../model';
import { meterToView, MeterViewModel } from './convert-meter';
import { AbsoluteTime, Time } from './../../model';
import { keyToView, KeyViewModel } from './convert-key';
import { FlagType, noteToView, NoteViewModel } from './note-view-model';
import { ClefType } from '../../model';
import { Note, NoteDirection } from '../../model';
import { Clef } from '../../model';
import { Sequence } from '../../model';
import { StaffDef } from '../../model';
import { Key } from '../../model';
import { calcBeamGroups } from '../../model';

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
    beamings?: BeamingViewModel[];
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
    return { staves: def.staves.map((staff, staffNo) => staffModelToViewModel(staff, staffNo)) };
}

export function staffModelToViewModel(def: StaffDef, staffNo = 0): StaffViewModel {

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

    def.voices.forEach((voice, voiceNo) => {        
        const voiceSequence = new Sequence(voice.content);
        const voiceTimeSlots = voiceSequence.groupByTimeSlots();
        const voiceEndTime = Time.fromStart(voiceSequence.duration);
        const voiceBeamGroups = meterModel ? calcBeamGroups(voiceSequence, meterModel) : [];

        if (Time.sortComparison(voiceEndTime, staffEndTime) > 0) {
            staffEndTime = voiceEndTime;
        }

        const accidentalManager = new AccidentalManager();
        if (def.initialKey) accidentalManager.setKey(new Key(def.initialKey));

        voiceTimeSlots.forEach((voiceTimeSlot, slotNo) => {
            const slot = getTimeSlot(timeSlots, voiceTimeSlot.time);
            //timeSlots.find(item => Time.equals(item.absTime, voiceTimeSlot.time));
            
            if (nextBarIterator && Time.sortComparison(slot.absTime, nextBar) >= 0) {
                accidentalManager.newBar();
                nextBar = nextBarIterator.next().value;
            }

            const elements = voiceTimeSlot.elements.map((note, noteNo) => {
                const bg = voiceBeamGroups.find(vbg => vbg.notes.indexOf(note) > -1);
                
                if (bg && bg.notes[0] === note) {
                    let noteTime = voiceTimeSlot.time;
                    const beaming = {
                        noteRefs: bg.notes.map((nt, idx) => { 
                            const res = { absTime: noteTime, uniq: `${staffNo}-${voiceNo}-${slotNo + idx}` };
                            noteTime = Time.addTime(noteTime, nt.duration);
                            return res;
                        }
                        ),
                        beams: bg.beams
                    };
                    if (slot.beamings) {
                        slot.beamings.push(beaming);
                    } else {
                        slot.beamings = [beaming];
                    }
                    
                    //console.log('beamings', slot);
                    
                }

                const noteClone = Note.clone(note, { 
                    direction: note.direction ? note.direction : voice.noteDirection,
                    uniq: `${staffNo}-${voiceNo}-${slotNo}`
                });
                const noteView = noteToView(noteClone, clef);
                
                if (bg) noteView.flagType = FlagType.Beam;

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
                const accidentalDisplacements = displaceAccidentals(accidentals.map(acc => acc.position));
                accidentals.forEach((acc, idx) => { acc.displacement = accidentalDisplacements[idx]; });

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
