import { cloneNote, voiceContentToSequence, voiceSequenceToDef } from '../../model';
import { FlexibleSequence } from './../score/flexible-sequence';
import { LongDecorationType } from './../decorations/decoration-type';
import { TimeSpan } from './../rationals/time';
import { ISequence, MusicEvent, isClefChange, isKeyChange, isMeterChange, isNote } from './../score/sequence';
import { InsertionPoint, InsertionPointDef } from './../../editor/insertion-point';
import { MeterFactory } from './../states/meter';
import { Key } from './../states/key';
import { Clef } from './../states/clef';
import { RepeatDef } from '../score/repeats';
import { StaffDef } from '../score/staff';
import { ScoreDef } from './../score/score';
import { Meter } from '../states/meter';
import { Note } from '../notes/note';
import { Alteration, Pitch } from '../pitches/pitch';
import { Time } from '../rationals/time';
import { createStateMap, getStateAt } from '../../logical-view/view-model/state-map';
import { VariableRepository, createRepo, setVar, valueOf } from '../score/variables';
import R = require('ramda');
import { Enharmonic, enharmonicChange } from '../pitches/intervals';
import { StateChange } from '../states/state';
import { FlexibleItem, ProjectDef, isProjectDef } from '../score/types';
import { ClefFlex, makeClef } from './clef-flex';
import { KeyFlex, makeKey } from './key-flex';
import { MeterFlex, makeMeter } from './meter-flex';
import { NoteFlex, makeNote } from './note-flex';
import { ScoreFlex, makeScore } from './score-flex';
import { ProjectFlex, makeProject } from './project-flex';

export interface JMusicSettings {
    content: FlexibleItem[][];
    clefs?: (Clef | string)[];
    meter?: Meter | string;
    key?: Key | string;
}

export interface JMusicVars {
    [key: string]: FlexibleItem;
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
export class JMusic implements ScoreDef {

    constructor(scoreFlex?: ProjectFlex, vars?: JMusicVars) {

        this.project = makeProject(scoreFlex, vars);

/*        this.vars = createRepo(project.vars);
        this.staves = project.score.staves;
        this.repeats = project.score.repeats;
*/
    }

    project: ProjectDef;
    //private _staves: StaffDef[] = [];
    public get staves(): StaffDef[] {
        return this.project.score.staves;
    }
    /*public set staves(value: StaffDef[]) {
        this._staves = value;
    }*/
    //private _repeats?: RepeatDef[] | undefined;
    public get repeats(): RepeatDef[] | undefined {
        return this.project.score.repeats;
    }
    /*public set repeats(value: RepeatDef[] | undefined) {
        this._repeats = value;
    }*/
    //private _vars: VariableRepository;
    public get vars(): VariableRepository {
        return createRepo(this.project.vars);
    }
    /*public set vars(value: VariableRepository) {
        this._vars = value;
    }*/

    changeHandlers: ChangeHandler[] = [];

    setVar(id: string, value: FlexibleItem): void {
        this.project.vars = setVar(this.vars, id, value).vars;
    }

    sequenceFromInsertionPoint(ins: InsertionPoint): ISequence {
        return voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content);
    }

    noteFromInsertionPoint(ins: InsertionPoint): Note {
        return voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).groupByTimeSlots('0').filter(ts => Time.equals(ts.time, ins.time))[0].elements[0];
    }

    insertElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void {
        this.staves[ins.staffNo].voices[ins.voiceNo].content = voiceSequenceToDef(new FlexibleSequence(voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).chainElements(
            (ct, time) => {
                if (!Time.equals(time, ins.time)) return [ct];
                if (checkType(ct)) return [];
                return isNote(ct) ? [element, ct] : [ct];
            }
        )));
    }

    appendElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent): void {
        this.staves[ins.staffNo].voices[ins.voiceNo].content = 
            [
                ...voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).elements,
                element
            ]
        ;
    }

    replaceNoteAtInsertionPoint(ins: InsertionPoint, fromNote: Note, toNote: Note): void {
        this.staves[ins.staffNo].voices[ins.voiceNo].content = voiceSequenceToDef(new FlexibleSequence(voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).chainElements(
            (ct, time) => {
                return [Time.equals(time, ins.time) && isNote(ct) ? toNote : ct];
            }
        )));
    }

    deleteNoteAtInsertionPoint(ins: InsertionPoint, fromNote: Note): void {
        this.staves[ins.staffNo].voices[ins.voiceNo].content = voiceSequenceToDef(new FlexibleSequence(voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).filterElements(
            (ct, time) => {
                return !(Time.equals(time, ins.time) && isNote(ct));
            }
        )));
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
        const note = this.noteFromInsertionPoint(ins);
        const note1 = cloneNote(note, { nominalDuration: time });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    addPitch(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        const note = this.noteFromInsertionPoint(ins);
        const pitches = R.append(pitch, note.pitches);
        const note1 = cloneNote(note, {pitches});
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    setPitches(ins: InsertionPoint, pitches: Pitch[]): void {
        const note = this.noteFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    removePitch(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        //const seq = this.sequenceFromInsertionPoint(ins);
        const note = this.noteFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches: note.pitches.filter(p => p.diatonicNumber !== pitch?.diatonicNumber) });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    changePitchEnharm(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        const note = this.noteFromInsertionPoint(ins);
        //const seq = this.sequenceFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches: note.pitches.map(p => {
            return enharmonicChange(p, Enharmonic.BestBet);
        }) });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    alterPitch(ins: InsertionPoint, alteration: number, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        const note = this.noteFromInsertionPoint(ins);
        //const seq = this.sequenceFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches: note.pitches.map(p => {
            if (Math.abs(p.alteration + alteration) >= 3) {
                const pitch = p.pitchClassNumber + alteration;
                if (pitch < 0) return new Pitch(pitch + 7, p.octave - 1, 0);    
                if (pitch >= 7) return new Pitch(pitch - 7, p.octave + 1, 0);    
                return new Pitch(( + 7) % 7, p.octave, 0);    
            }
            return new Pitch(p.pitchClassNumber, p.octave, (p.alteration + alteration) as Alteration);
        }) });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
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