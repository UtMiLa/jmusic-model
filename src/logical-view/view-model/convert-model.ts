import { RepeatDef } from './../../model/score/repeats';
import { getStateAt, ScopedTimeKey } from './state-map';
import { RationalDef } from './../../model/rationals/rational';
import { StateChange } from './../../model/states/state';
import { IndexedMap } from './../../tools/time-map';
import { Meter, MeterMap } from './../../model/states/meter';
import { BeamGroup, BeamDef } from './../../model/notes/beaming';
import { AccidentalManager, displaceAccidentals } from './../../model/states/key';
import { getAllBars, getDuration, ScoreDef, setNoteDirection, TimeSlot, TupletState } from './../../model';
import { MeterFactory } from './../../model';
import { meterToView } from './convert-meter';
import { AbsoluteTime, Time } from './../../model';
import { keyToView } from './convert-key';
import { FlagType, NoteViewModel, TupletViewModel, BeamingViewModel } from './note-view-model';
import { NoteDirection } from '../../model';
import { Clef } from '../../model';
import { StaffDef } from '../../model';
import { Key } from '../../model';
import { calcBeamGroups } from '../../model';
import { noteToView } from './convert-note';
import { TimeSlotViewModel, ScoreViewModel, StaffViewModel, AccidentalViewModel, TieViewModel, BarType } from './score-view-model';
import { VoiceDef } from '../../model/score/voice';
import { createIdPrefix, createStateMap } from './state-map';
import { repeatsToView } from './convert-repeat';
import { LongDecoToView } from './convert-decoration';
import { EventType, getExtendedTime } from '../../model/score/timing-order';

export interface SubsetDef {
    startTime: AbsoluteTime;
    endTime: AbsoluteTime;
}

class State {
    constructor (
        public voiceBeamGroups: BeamGroup[], 
        public staffNo: number, 
        public voiceNo: number, 
        public voice: VoiceDef, 
        public clef: Clef
    ) {
        const voiceSequence = voice.content;
        this.voiceTimeSlots = voiceSequence.groupByTimeSlots(createIdPrefix(staffNo, voiceNo));
    }

    public nextBarIterator: IterableIterator<AbsoluteTime> | undefined;
    public nextBar = Time.EternityTime;
    public tupletGroups = [] as TupletViewModel[];
    public tupletGroup: TupletViewModel | undefined;
    public voiceTimeSlots: TimeSlot[];

    
    findNoteTime(uniq: string): AbsoluteTime {
        const slot = this.voiceTimeSlots.find(vts => vts.elements.find(elm => elm.uniq === uniq));
        if (!slot) throw 'Note not found: ' + uniq;
        return slot.time;
    }


    private _voiceTimeSlot: TimeSlot | undefined;
    public get voiceTimeSlot(): TimeSlot {
        if (!this._voiceTimeSlot) throw 'Internal error (voiceTimeSlot)';
        return this._voiceTimeSlot;
    }
    public set voiceTimeSlot(value: TimeSlot) {
        this._voiceTimeSlot = value;

        if (this.nextBarIterator && Time.sortComparison(this.slot.absTime, this.nextBar) >= 0) {
            this.newBar();
            this.nextBar = this.nextBarIterator.next().value;
        }

    }

    private _meter?: Meter;

    private _key?: Key | undefined;
    public get key(): Key | undefined {
        return this._key;
    }
    public set key(value: Key | undefined) {
        if (!value) throw 'Cannot set key to undefined';
        this._key = value;
        this.accidentalManager.setKey(value);
    }
    public slotNo = -1;
    private _slot: TimeSlotViewModel | undefined;
    public get slot(): TimeSlotViewModel {
        if (!this._slot) throw 'Internal error (slot)';
        return this._slot;
    }
    public set slot(value: TimeSlotViewModel) {
        this._slot = value;
    }

    public accidentalManager = new AccidentalManager();

    addNotes(elements: NoteViewModel[]): void {
        this.slot.notes = this.slot.notes.concat(elements);
    }

    get meter(): Meter | undefined { 
        return this._meter; 
    }

    setMeter(meter: Meter, atTime: AbsoluteTime): void {
        this._meter = meter;
        if(meter) {
            this.nextBarIterator = getAllBars(meter, atTime);
            this.nextBar = this.nextBarIterator.next().value;
        }
    }

    newBar(): void {
        this.accidentalManager.newBar();
    }



    updateTupletViewModel(): void {
        this.voiceTimeSlot.elements.forEach((note) => {
            switch (note.tupletGroup) {
                case TupletState.Begin: 
                    if (this.tupletGroup) throw 'Internal Error (createTupletViewModel)';
                    this.tupletGroup = { noteRefs: [], tuplets: [] };
                    if (!this.slot.tuplets) this.slot.tuplets = [];
                    this.slot.tuplets.push(this.tupletGroup);
                    this.tupletGroup.noteRefs.push({absTime: this.voiceTimeSlot.time, uniq: note.uniq + ''});
                    this.tupletGroup.tuplets.push({
                        fromIdx: 0,
                        tuplet: '' + (note.tupletFactor as RationalDef).denominator,
                        toIndex: undefined
                    });
                    break;
                case TupletState.Inside:
                    if (!this.tupletGroup) throw 'Internal Error (createTupletViewModel)';
                    this.tupletGroup.noteRefs.push({absTime: this.voiceTimeSlot.time, uniq: note.uniq + ''});
                    break;
                case TupletState.End: 
                    if (!this.tupletGroup) throw 'Internal Error (createTupletViewModel)';
                    this.tupletGroup.noteRefs.push({absTime: this.voiceTimeSlot.time, uniq: note.uniq + ''});
                    this.tupletGroup.tuplets[0].toIndex = this.tupletGroup.noteRefs.length - 1;
                    this.tupletGroups.push(this.tupletGroup);
                    this.tupletGroup = undefined;
                    break;
            }
        });
    }
    
    


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


export function scoreModelToViewModel(def: ScoreDef, restrictions: SubsetDef = { startTime: Time.StartTimeMinus, endTime: Time.EternityTime }): ScoreViewModel {
    const stateMap = createStateMap(def);
    //console.log('scoreModelToViewModel', def);    

    return { staves: def.staves.map((staff, staffNo) => staffModelToViewModel(staff, stateMap.clone((key: ScopedTimeKey, value: StateChange) => {
        return key.scope === undefined || key.scope === staffNo;
    }), staffNo, restrictions, def.repeats)) };
}

function staffModelToViewModel(def: StaffDef, stateMap: IndexedMap<StateChange, ScopedTimeKey>, staffNo = 0, restrictions: SubsetDef, repeats: RepeatDef[] | undefined = undefined): StaffViewModel {

    //console.log(def, stateMap, staffNo);
    //(restrictions.startTime as ExtendedTime).extended = -Infinity;
    restrictions.startTime = { ...restrictions.startTime, extended: -Infinity } as AbsoluteTime;

    const clef = new Clef(def.initialClef);

    const timeSlots: TimeSlotViewModel[] = [
        {
            absTime: getExtendedTime(Time.newAbsolute(0,1), EventType.Bar),
            notes: [],
            clef: { 
                position: 1,
                clefType: def.initialClef.clefType,
                line: def.initialClef.line
            },
            
            key: keyToView(new Key(def.initialKey), new Clef(def.initialClef))           
        
        }
    ];

    const meter = def.initialMeter ? MeterFactory.createRegularMeter(def.initialMeter) : undefined;
    const meterMap = new MeterMap();

    if (meter) {
        const meterVM = meter ? meterToView(meter) : undefined;
        timeSlots[0].meter = meterVM;
        meterMap.add(Time.newAbsolute(0, 1), meter);
    }

    let currentClef = new Clef(def.initialClef);
    stateMap.forEach((key, value) => {
        const ts = getTimeSlot(timeSlots, key.absTime);
        if (value.key) ts.key = keyToView(value.key, currentClef);
        if (value.meter) {
            ts.meter = meterToView(value.meter);
            meterMap.add(key.absTime, value.meter);
        }
        if (value.clef) {
            currentClef = value.clef;
            ts.clef =  { 
                position: 1,
                clefType: value.clef.def.clefType,
                change: true,
                line: value.clef.def.line
            };
        }
    });


    const staffEndTime = createViewModelsForVoice(def, staffNo, meter, meterMap, clef, timeSlots, stateMap);

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
    if (!initialStates.clef) initialStates.clef = new Clef(def.initialClef);
    if (!initialStates.meter && def.initialMeter) initialStates.meter = MeterFactory.createRegularMeter(def.initialMeter);
    if (!initialStates.key) initialStates.key = new Key(def.initialKey);

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
        res.timeSlots[0].clef = {
            position: 1,
            clefType: initialStates.clef.def.clefType,
            line: initialStates.clef.def.line
        };
        //res.timeSlots[0].meter = initialStates.meter ? meterToView(initialStates.meter) : undefined;
    }

    return res;
}


function createViewModelsForVoice(def: StaffDef, staffNo: number, meter: Meter | undefined, meterMap: MeterMap, clef: Clef, timeSlots: TimeSlotViewModel[], stateMap: IndexedMap<StateChange, ScopedTimeKey>) {
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
            state.key = new Key(def.initialKey);
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

            createTimeSlotViewModels(state, voiceTimeSlot, stateMap, staffNo);
        });

    });
    return staffEndTime;
}

function createTimeSlotViewModels(state: State, voiceTimeSlot: TimeSlot, stateMap: IndexedMap<StateChange, ScopedTimeKey>, staffNo: number) {

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

    const elements = createNoteViewModels(state);

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

function createAccidentalViewModel(state: State) {
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



function createNoteViewModels(state: State): NoteViewModel[] {
    return state.voiceTimeSlot.elements.map((note) => {
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
        const noteView = noteToView(noteClone, state.clef);

        if (bg)
            noteView.flagType = FlagType.Beam;

        return noteView;
    });
}

export const __internal = { 
    staffModelToViewModel: (def: StaffDef, stateMap: IndexedMap<StateChange, ScopedTimeKey>, staffNo = 0, restrictions: SubsetDef = { startTime: Time.StartTime, endTime: Time.EternityTime }) => staffModelToViewModel(def, stateMap, staffNo, restrictions), createNoteViewModels, State };