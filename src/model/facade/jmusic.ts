import { LensItem, cloneNote, doWithNote, lensItemNone, lensItemOf, projectLensByTime, voiceContentToSequence, voiceSequenceToDef } from '../../model';
import { FlexibleSequence } from './../score/flexible-sequence';
import { LongDecorationType } from './../decorations/decoration-type';
import { TimeSpan } from './../rationals/time';
import { ISequence, MusicEvent, isClefChange, isKeyChange, isMeterChange, isNote } from './../score/sequence';
import { InsertionPoint, InsertionPointDef } from './../../editor/insertion-point';
import { MeterFactory } from './../states/meter';
import { Key } from './../states/key';
import { Clef } from './../states/clef';
import { RepeatDef } from '../score/repeats';
import { Staff, staffDefToStaff } from '../score/staff';
import { Score, ScoreDef } from './../score/score';
import { Meter } from '../states/meter';
import { Note } from '../notes/note';
import { Alteration, Pitch } from '../pitches/pitch';
import { Time } from '../rationals/time';
import { createStateMap, getStateAt } from '../../logical-view/view-model/state-map';
import { VariableRepository, createRepo, setVar, valueOf } from '../score/variables';
import R = require('ramda');
import { Enharmonic, enharmonicChange } from '../pitches/intervals';
import { StateChange } from '../states/state';
import { FlexibleItem, ProjectDef, VarDict } from '../score/types';
import { ClefFlex, makeClef } from './clef-flex';
import { KeyFlex, makeKey } from './key-flex';
import { MeterFlex, makeMeter } from './meter-flex';
import { NoteFlex, makeNote } from './note-flex';
import { ProjectFlex, makeProject } from './project-flex';

export interface JMusicSettings {
    content: FlexibleItem[][];
    clefs?: (Clef | string)[];
    meter?: Meter | string;
    key?: Key | string;
}


export type ChangeHandler = () => void;


export const initStateInSequence = (s: ISequence) => {
    const slots = s.groupByTimeSlots('');
    if (!slots.length) return {};
    const firstSlot = slots[0];
    if (!firstSlot.states) return {};   
    
    const res = {} as any;
    const key = firstSlot.states.find(st => st.key);
    const clef = firstSlot.states.find(st => st.clef);
    const meter = firstSlot.states.find(st => st.meter);

    if (key) res.key = key.key;
    if (clef) res.clef = clef.clef;
    if (meter) res.meter = meter.meter;

    return res;
};



/** Facade object for music scores */
export class JMusic implements Score {

    constructor(scoreFlex?: ProjectFlex, vars?: VarDict) {

        this.project = makeProject(scoreFlex, vars);

    }

    project: ProjectDef;

    public get staves(): Staff[] {
        return this.project.score.staves.map(sd => staffDefToStaff(sd, this.vars));
    }

    public get repeats(): RepeatDef[] | undefined {
        return this.project.score.repeats;
    }

    public get vars(): VariableRepository {
        return createRepo(this.project.vars);
    }

    changeHandlers: ChangeHandler[] = [];

    setVar(id: string, value: FlexibleItem): void {
        this.project.vars = setVar(this.vars, id, value).vars;
    }

    sequenceFromInsertionPoint(ins: InsertionPoint): ISequence {
        return this.staves[ins.staffNo].voices[ins.voiceNo].content;
    }

    noteFromInsertionPoint(ins: InsertionPoint): Note {
        return this.staves[ins.staffNo].voices[ins.voiceNo].content.groupByTimeSlots('0').filter(ts => Time.equals(ts.time, ins.time))[0].elements[0];
    }

    insertElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void {
        this.project.score.staves[ins.staffNo].voices[ins.voiceNo].contentDef = voiceSequenceToDef(new FlexibleSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content.chainElements(
            (ct, time) => {
                if (!Time.equals(time, ins.time)) return [ct];
                if (checkType(ct)) return [];
                return isNote(ct) ? [element, ct] : [ct];
            }
        )));
    }

    appendElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent): void {
        this.project.score.staves[ins.staffNo].voices[ins.voiceNo].contentDef = 
            [
                ...this.staves[ins.staffNo].voices[ins.voiceNo].content.elements,
                element
            ]
        ;
    }

    replaceNoteAtInsertionPoint(ins: InsertionPoint, noteConverter: (fromNote: LensItem) => LensItem): void {
        
        /*this.project.score.staves[ins.staffNo].voices[ins.voiceNo].contentDef = voiceSequenceToDef(new FlexibleSequence(voiceContentToSequence(this.project.score.staves[ins.staffNo].voices[ins.voiceNo].contentDef).chainElements(
            (ct, time) => {
                return [Time.equals(time, ins.time) && isNote(ct) ? toNote : ct];
            }
        )));*/
        const lens = projectLensByTime({ staff: ins.staffNo, voice: ins.voiceNo, time: ins.time, eventFilter: isNote });
        this.project = R.over(lens, noteConverter, this.project);

    }

    deleteNoteAtInsertionPoint(ins: InsertionPoint, fromNote: Note): void {
        /*this.staves[ins.staffNo].voices[ins.voiceNo].content = voiceSequenceToDef(new FlexibleSequence(voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).filterElements(
            (ct, time) => {
                return !(Time.equals(time, ins.time) && isNote(ct));
            }
        )));*/
        const lens = projectLensByTime({ staff: ins.staffNo, voice: ins.voiceNo, time: ins.time, eventFilter: isNote });
        this.project = R.set(lens, lensItemNone, this.project);

    }

    pitchFromInsertionPoint(ins: InsertionPoint): Pitch {
        const stateMap = createStateMap(this);
        const state = getStateAt(stateMap, ins.time, ins.staffNo);
        if (!state.clef) {
            const clef = this.staves[ins.staffNo].initialClef;
            if (!clef) throw 'Cannot map position without a clef';

            state.clef = new Clef(clef);
        }
        
        return state.clef.mapPosition(ins.position);
    }

    clearScore(ins: InsertionPoint, voice?: string | JMusicSettings | ScoreDef): void {
        //this.staves = 
        this.project = makeProject(voice);

        this.didChange();
    }

    addRepeat(repeat: RepeatDef): void {
        if (!this.project.score.repeats)
            this.project.score.repeats = [];
        this.project.score.repeats?.push(repeat);
    }

    appendNote(ins: InsertionPoint, noteInput: NoteFlex): void {
        const note = makeNote(noteInput);
        this.appendElementAtInsertionPoint(ins, note);
        this.didChange();
    }

    deleteNote(ins: InsertionPoint): void {
        const note = this.noteFromInsertionPoint(ins);
        this.deleteNoteAtInsertionPoint(ins, note);
        this.didChange();
    }

    setNoteValue(ins: InsertionPoint, time: TimeSpan): void {
        this.replaceNoteAtInsertionPoint(ins, doWithNote(note => lensItemOf(cloneNote(note, { nominalDuration: time }))));
        this.didChange();
    }

    addPitch(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        this.replaceNoteAtInsertionPoint(ins, doWithNote(note => lensItemOf(cloneNote(note, { pitches : R.append<Pitch>(pitch as Pitch, note.pitches) }))));
        this.didChange();
    }

    setPitches(ins: InsertionPoint, pitches: Pitch[]): void {
        this.replaceNoteAtInsertionPoint(ins, doWithNote(note => lensItemOf(cloneNote(note, { pitches }))));
        this.didChange();
    }

    removePitch(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }

        this.replaceNoteAtInsertionPoint(ins, doWithNote(note => lensItemOf(cloneNote(note, { pitches: note.pitches.filter(p => p.diatonicNumber !== pitch?.diatonicNumber) }))));
        this.didChange();
    }

    changePitchEnharm(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }

        this.replaceNoteAtInsertionPoint(ins, doWithNote(note => lensItemOf(cloneNote(note, { pitches: note.pitches.map(p => {
            return enharmonicChange(p, Enharmonic.BestBet);
        }) }))));
        this.didChange();
    }

    alterPitch(ins: InsertionPoint, alteration: number, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }

        this.replaceNoteAtInsertionPoint(ins, doWithNote(note => lensItemOf(
            cloneNote(note, { pitches: note.pitches.map(p => {
                if (Math.abs(p.alteration + alteration) >= 3) {
                    const pitch = p.pitchClassNumber + alteration;
                    if (pitch < 0) return new Pitch(pitch + 7, p.octave - 1, 0);    
                    if (pitch >= 7) return new Pitch(pitch - 7, p.octave + 1, 0);    
                    return new Pitch(( + 7) % 7, p.octave, 0);    
                }
                return new Pitch(p.pitchClassNumber, p.octave, (p.alteration + alteration) as Alteration);
            }) })
        )));
        this.didChange();
    }

    addLongDecoration(decorationType: LongDecorationType, ins: InsertionPoint, length: TimeSpan): void {
        //const seq = this.sequenceFromInsertionPoint(ins);

        //seq.insertElement(ins.time, { longDeco: decorationType, length });
        this.insertElementAtInsertionPoint(ins, { longDeco: decorationType, length }, () => false);
        this.didChange();
    }

    addMeterChg(ins: InsertionPoint, meter: MeterFlex): void {
        const m = makeMeter(meter);
        
        this.insertElementAtInsertionPoint(ins, StateChange.newMeterChange(MeterFactory.createRegularMeter(m)), isMeterChange);
        this.didChange();
    }

    addKeyChg(ins: InsertionPoint, key: KeyFlex): void {
        const m = makeKey(key);
        
        this.insertElementAtInsertionPoint(ins, StateChange.newKeyChange(new Key(m)), isKeyChange);
        this.didChange();
    }

    addClefChg(ins: InsertionPoint, clef: ClefFlex): void {
        const m = makeClef(clef);
        
        this.insertElementAtInsertionPoint(ins, StateChange.newClefChange(new Clef(m)), isClefChange);
        this.didChange();
    }

    onChanged(handler: ChangeHandler): void {        
        this.changeHandlers.push(handler);
    }

    didChange(): void {
        this.changeHandlers.forEach(handler => handler());
    }

    getView(varname?: string): JMusic {
        if (varname) {
            return new JMusic({content: [[valueOf(this.vars, varname).elements]]});
        }
        return this;
    }

}