import { ElementIdentifier, MusicSelection, SelectionFunc } from './../../selection/selection-types';
import { RepeatDef } from './../../model/score/repeats';
import { getStateAt, ScopedTimeKey } from './state-map';
import { StateChange } from './../../model/states/state';
import { IndexedMap } from './../../tools/time-map';
import { Meter, MeterMap } from './../../model/states/meter';
import { BeamDef } from './../../model/notes/beaming';
import { DiatonicKey, displaceAccidentals } from './../../model/states/key';
import { getDuration, Score, ScoreDef, setNoteDirection, Staff, TimeSlot, voiceContentToSequence } from './../../model';
import { MeterFactory } from './../../model';
import { meterToView } from './convert-meter';
import { AbsoluteTime, Time } from './../../model';
import { keyToView } from './convert-key';
import { FlagType, NoteViewModel, BeamingViewModel } from './note-view-model';
import { NoteDirection } from '../../model';
import { Clef } from '../../model';
import { Key } from '../../model';
import { calcBeamGroups } from '../../model';
import { noteToView } from './convert-note';
import { TimeSlotViewModel, ScoreViewModel, StaffViewModel, AccidentalViewModel, TieViewModel, BarType, ClefViewModel } from './score-view-model';
import { createStateMap } from './state-map';
import { repeatsToView } from './convert-repeat';
import { LongDecoToView } from './convert-decoration';
import { EventType, getExtendedTime } from '../../model/score/timing-order';
import { State } from './running-state';
import { option } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';



export interface SubsetDef {
    startTime: AbsoluteTime;
    endTime: AbsoluteTime;
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


export function scoreModelToViewModel(def: Score, selection: option.Option<SelectionFunc> = option.none, restrictions: SubsetDef = { startTime: Time.StartTimeMinus, endTime: Time.EternityTime }): ScoreViewModel {
    const stateMap = createStateMap(def);
    //console.log('scoreModelToViewModel', def);    

    return { staves: def.staves.map((staff, staffNo) => staffModelToViewModel(staff, stateMap.clone((key: ScopedTimeKey, value: StateChange) => {
        return key.scope === undefined || key.scope === staffNo;
    }), staffNo, restrictions, selection, def.repeats)) };
}

function staffModelToViewModel(def: Staff, stateMap: IndexedMap<StateChange, ScopedTimeKey>, staffNo = 0, restrictions: SubsetDef, selection: option.Option<SelectionFunc>, 
    repeats: RepeatDef[] | undefined = undefined): StaffViewModel {

    //console.log(def, stateMap, staffNo);
    //(restrictions.startTime as ExtendedTime).extended = -Infinity;
    restrictions.startTime = { ...restrictions.startTime, extended: -Infinity } as AbsoluteTime;

    const clef = def.initialClef;

    const timeSlots: TimeSlotViewModel[] = [
        {
            absTime: getExtendedTime(Time.newAbsolute(0,1), EventType.Bar),
            notes: [],
            clef: { 
                position: 1,
                clefType: def.initialClef.def.clefType,
                line: def.initialClef.def.line,
                transposition: def.initialClef.def.transpose ?? 0
            },
            
            key: keyToView(def.initialKey, def.initialClef)
        
        }
    ];

    const meter = def.initialMeter;
    const meterMap = new MeterMap();

    if (meter) {
        const meterVM = meter ? meterToView(meter) : undefined;
        timeSlots[0].meter = meterVM;
        meterMap.add(Time.newAbsolute(0, 1), meter);
    }

    let currentClef = def.initialClef;
    let currentKey = def.initialKey;
    stateMap.forEach((key, value) => {
        const ts = getTimeSlot(timeSlots, key.absTime);
        if (value.key) {
            ts.key = keyToView(value.key, currentClef, currentKey);
            currentKey = value.key;
        }
        if (value.meter) {
            ts.meter = meterToView(value.meter);
            meterMap.add(key.absTime, value.meter);
        }
        if (value.clef) {
            currentClef = value.clef;
            ts.clef = { 
                position: 1,
                clefType: value.clef.def.clefType,
                change: true,
                line: value.clef.def.line,
                transposition: value.clef.def.transpose ?? 0
            };
        }
    });


    const staffEndTime = createViewModelsForVoice(def, staffNo, meter, meterMap, clef, timeSlots, stateMap, selection);

    if (meter) {
        addBarLines(meterMap, staffEndTime, timeSlots);
    }

    if (repeats) {
        const repeatElements = repeatsToView(repeats);
        repeatElements.forEach(repeatElm => {
            //console.log('repeat', repeatElm);
            const slot = getTimeSlot(timeSlots, repeatElm.time);
            if (!slot.bar) {
                slot.bar = { barType: BarType.None };
            }
            if (repeatElm.repeatEnd) slot.bar.repeatEnd = true;
            if (repeatElm.repeatStart) slot.bar.repeatStart = true;
        });
    }

    const initialStates = getStateAt(stateMap, restrictions.startTime, staffNo);
    if (!initialStates.clef) initialStates.clef = def.initialClef;
    if (!initialStates.meter && def.initialMeter) initialStates.meter = def.initialMeter;
    if (!initialStates.key) initialStates.key = def.initialKey;

    const res = { 
        timeSlots: timeSlots
            .filter(ts => Time.sortComparison(ts.absTime, restrictions.startTime) >= 0 && Time.sortComparison(ts.absTime, restrictions.endTime) <= 0)
            .map(ts => {
                if(Time.sortComparison(ts.absTime, restrictions.endTime) === 0) { 
                    return {...ts, notes: [], accidentals: [], ties: [], tuplets: [], beamings: []}; 
                } else { 
                    return ts; 
                }
            })
            .sort((ts1, ts2) => Time.sortComparison(ts1.absTime, ts2.absTime))
    };

    if ((restrictions.startTime.numerator || restrictions.endTime.denominator) && res.timeSlots[0]) {
        res.timeSlots[0].key = keyToView(initialStates.key, initialStates.clef);
        res.timeSlots[0].clef = initialStates.clef ? clefToView(initialStates.clef) : undefined;
        //res.timeSlots[0].meter = initialStates.meter ? meterToView(initialStates.meter) : undefined;
    }

    return res;
}


function clefToView(clef: Clef): ClefViewModel {
    return {
        position: 1,
        clefType: clef.def.clefType,
        line: clef.def.line,
        transposition: clef.def.transpose ?? 0
    };
}

function createViewModelsForVoice(def: Staff, staffNo: number, meter: Meter | undefined, meterMap: MeterMap, clef: Clef, 
    timeSlots: TimeSlotViewModel[], stateMap: IndexedMap<StateChange, ScopedTimeKey>, selection: option.Option<SelectionFunc>) {
    let staffEndTime = Time.newAbsolute(0, 1);

    def.voices.forEach((voice, voiceNo) => {
        const voiceSequence = voice.content;
        const voiceEndTime = Time.fromStart(voiceSequence.duration);
        const voiceBeamGroups = meter ? calcBeamGroups(voiceSequence, meterMap.getAllBeats(), `${staffNo}-${voiceNo}`) : [];

        if (Time.sortComparison(voiceEndTime, staffEndTime) > 0) {
            staffEndTime = voiceEndTime;
        }

        const state = new State(voiceBeamGroups, staffNo, voiceNo, voice, clef);
        if (def.initialKey)
            state.key = def.initialKey;
        if (meter)
            state.setMeter(meter, Time.newAbsolute(0, 1));


        state.voiceTimeSlots.forEach((voiceTimeSlot, slotNo) => {
            state.slot = getTimeSlot(timeSlots, voiceTimeSlot.time);
            state.voiceTimeSlot = voiceTimeSlot;
            state.slotNo = slotNo;
            state.updateTupletViewModel();

            if (voiceTimeSlot.decorations) {
                if (!state.slot.decorations) state.slot.decorations = [];
                voiceTimeSlot.decorations.forEach(vc => {
                    const decoVM = LongDecoToView(vc, voiceTimeSlot.time, state.voiceTimeSlots);
                    if (!decoVM) throw 'Error converting long decoration';
                    state.slot.decorations?.push(decoVM);
                });
            }

            createTimeSlotViewModels(state, voiceTimeSlot, stateMap, staffNo, selection);
        });

    });
    return staffEndTime;
}

function createTimeSlotViewModels(state: State, voiceTimeSlot: TimeSlot, stateMap: IndexedMap<StateChange, ScopedTimeKey>, staffNo: number, selection: option.Option<SelectionFunc>) {

    const clefChg = stateMap.peekLatest({ absTime: voiceTimeSlot.time, scope: staffNo }, (key, value) => !!value.clef);
    if (clefChg && clefChg.clef && clefChg.clef !== state.clef) {
        state.clef = clefChg.clef;
    }

    const keyChg = stateMap.peekLatest({ absTime: voiceTimeSlot.time, scope: undefined }, (key, value) => !!value.key);
    if (keyChg && keyChg.key && keyChg.key !== state.key) {
        state.key = keyChg.key;
    }

    const meterChg = stateMap.peekLatest({ absTime: voiceTimeSlot.time, scope: undefined }, (key, value) => !!value.meter);
    if (meterChg && meterChg.meter && meterChg.meter !== state.meter) {
        state.setMeter(meterChg.meter, voiceTimeSlot.time);
    }

    const elements = createNoteViewModels(state, selection);

    createAccidentalViewModel(state);

    state.addNotes(elements);

    createTieViewModel(state);
}

function addBarLines(meterMap: MeterMap, staffEndTime: AbsoluteTime, timeSlots: TimeSlotViewModel[]) {
    const barIterator = meterMap.getAllBars();
    let barTime: AbsoluteTime = getExtendedTime(barIterator.next().value, EventType.Bar);

    while (Time.sortComparison(barTime, staffEndTime) <= 0) {
        if (barTime.numerator > 0) {
            const slot = getTimeSlot(timeSlots, barTime);
            slot.bar = { barType: BarType.Simple };
        }
        //barTime = Time.addTime(barTime, measureTime);
        barTime = getExtendedTime(barIterator.next().value, EventType.Bar);
        //console.log('bar adding', slot, barTime);
    }
}

function createTieViewModel(state: State) {
    //voiceTimeSlot: TimeSlot, clef: Clef, voice: VoiceDef, slot: TimeSlotViewModel) {
    const ties = [] as TieViewModel[];
    state.voiceTimeSlot.elements.forEach(note => {
        if (note.tie) {
            //console.log('note tie', note);
            note.pitches.map(p => state.clef.map(p)).sort().forEach(pos => {
                //console.log('adding ties', pos);
                ties.push({
                    position: pos,
                    direction: note.direction === NoteDirection.Undefined ? state.voice.noteDirection : note.direction,
                    toTime: Time.addTime(state.voiceTimeSlot.time, getDuration(note))
                } as TieViewModel);
            });
        }
    });

    if (ties.length) {
        //console.log('setting ties', ties);
        state.slot.ties = state.slot.ties ? state.slot.ties.concat(ties) : ties;
    }
}

function createAccidentalViewModel(state: State) { // todo: this should be done per staff and not per voice, possibly in a second iteration
    const accidentals: AccidentalViewModel[] = [];
            
            
    state.voiceTimeSlot.elements.forEach(note => note.pitches.forEach(pitch => {
        const alt = state.accidentalManager.getAccidental(pitch);
        if (alt !== undefined)
            accidentals.push({ alteration: alt, position: state.clef.map(pitch), displacement: 0 });
    })
    );

    if (accidentals.length) {
        const accidentalDisplacements = displaceAccidentals(accidentals.map(acc => acc.position));
        accidentals.forEach((acc, idx) => { acc.displacement = accidentalDisplacements[idx]; });

        if (state.slot.accidentals) {
            state.slot.accidentals = state.slot.accidentals.concat(accidentals);
        } else {
            state.slot.accidentals = accidentals;
        }
    }

    return accidentals;
}



function createNoteViewModels(state: State, selection: option.Option<SelectionFunc> = option.none): NoteViewModel[] {
    return state.voiceTimeSlot.elements.map((note, elementNo) => {
        const bg = state.voiceBeamGroups.find(vbg => vbg.notes.find(n => n.uniq === note.uniq));

        if (bg && bg.notes[0].uniq === note.uniq) {
            let noteTime = state.voiceTimeSlot.time;
            const beaming: BeamingViewModel = {
                noteRefs: bg.notes.map((nt) => {
                    const res = { 
                        absTime: state.findNoteTime(nt.uniq + ''),
                        uniq: nt.uniq + '' 
                    };
                    noteTime = Time.addTime(noteTime, getDuration(nt));
                    return res;
                }
                ),
                beams: bg.beams.sort((a: BeamDef, b: BeamDef) => a.level - b.level)
            };
            if (note.grace) {
                beaming.grace = true;
            }
                            
            if (state.slot.beamings) {
                state.slot.beamings.push(beaming);
            } else {
                state.slot.beamings = [beaming];
            }

            //console.log('beamings', slot);
        }

        const noteClone = note.direction ? setNoteDirection(note, note.direction)
            : state.voice.noteDirection ? setNoteDirection(note, state.voice.noteDirection)
                : note;

        const testSelection = option.map<SelectionFunc, boolean>(s => s(
            { elementNo: state.slotNo, staffNo: state.staffNo, voiceNo: state.voiceNo }
        ));
        const fallback = option.getOrElse<boolean>(() => false);
        const isSelected = pipe(selection, testSelection, fallback);

        const noteView = noteToView(noteClone, state.clef, isSelected);

        if (bg)
            noteView.flagType = FlagType.Beam;

        return noteView;
    });
}

export const __internal = { 
    staffModelToViewModel: (def: Staff, stateMap: IndexedMap<StateChange, ScopedTimeKey>, staffNo = 0, selection: option.Option<SelectionFunc> = option.none, restrictions: SubsetDef = { startTime: Time.StartTime, endTime: Time.EternityTime }) => staffModelToViewModel(def, stateMap, staffNo, restrictions, selection), createNoteViewModels, State };