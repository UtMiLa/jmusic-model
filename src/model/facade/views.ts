import { InsertionPoint, InsertionPointDef } from '../../editor/insertion-point';
import { ChangeHandler, Clef, JMusic, Key, MeterFactory, VoiceContentDef } from '..';
import { LongDecorationType } from '../';
import { Note, cloneNote } from '../notes/note';
import { DomainConverter, LensItem, ProjectLens, doWithNote, lensItemNone, lensItemOf } from '../optics/lens';
import { Alteration, Pitch } from '../pitches/pitch';
import { TimeSpan } from '../rationals/time';
import { Score } from '../score/score';
import { ISequence, MusicEvent, isClefChange, isKeyChange, isMeterChange } from '../score/sequence';
import { Staff } from '../score/staff';
import { FlexibleItem } from '../';
import { VariableRepository, valueOf } from '../score/variables';
import { ClefFlex, makeClef } from './clef-flex';
import { KeyFlex, makeKey } from './key-flex';
import { MeterFlex, makeMeter } from './meter-flex';
import { NoteFlex, makeNote } from './note-flex';
import R = require('ramda');
import { createStateMap, getStateAt } from '../../logical-view/view-model/state-map';
import { enharmonicChange, Enharmonic } from '../pitches/intervals';
import { StateChange } from '../states/state';

export interface DisplayableView extends Score {    
    vars: VariableRepository;
    changeHandlers: ChangeHandler[];
    sequenceFromInsertionPoint(ins: InsertionPoint): ISequence;
    noteFromInsertionPoint(ins: InsertionPoint): Note;
    //domainConverter: DomainConverter<VoiceContentDef, MusicEvent[]>;
    pitchFromInsertionPoint(ins: InsertionPoint): Pitch;
    onChanged(handler: ChangeHandler): void;
    getView(varname?: string): DisplayableView;
}

export interface EditableView extends DisplayableView {
    setVar(id: string, value: FlexibleItem): void;
    insertElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void;
    appendElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent): void;
    replaceNoteAtInsertionPoint(ins: InsertionPoint, noteConverter: (fromNote: LensItem) => LensItem): void;
    deleteNoteAtInsertionPoint(ins: InsertionPoint, fromNote: Note): void;
    //clearScore(ins: InsertionPoint, voice?: string | JMusicSettings | ScoreDef): void;
    //addRepeat(repeat: RepeatDef): void;
    appendNote(ins: InsertionPoint, noteInput: NoteFlex): void;
    deleteNote(ins: InsertionPoint): void;
    setNoteValue(ins: InsertionPoint, time: TimeSpan): void;
    addPitch(ins: InsertionPoint, pitch?: Pitch): void;
    setPitches(ins: InsertionPoint, pitches: Pitch[]): void;
    removePitch(ins: InsertionPoint, pitch?: Pitch): void;
    changePitchEnharm(ins: InsertionPoint, pitch?: Pitch): void;
    alterPitch(ins: InsertionPoint, alteration: number, pitch?: Pitch): void;
    addLongDecoration(decorationType: LongDecorationType, ins: InsertionPoint, length: TimeSpan): void;
    addMeterChg(ins: InsertionPoint, meter: MeterFlex): void;
    addKeyChg(ins: InsertionPoint, key: KeyFlex): void;
    addClefChg(ins: InsertionPoint, clef: ClefFlex): void;
    getView(varname?: string): EditableView;
}

export abstract class EditView implements EditableView {
    //abstract project: ProjectDef;
    
    abstract changeHandlers: ChangeHandler[];

    abstract staves: Staff[];

    //abstract repeats: RepeatDef[] | undefined;

    abstract vars: VariableRepository;

    abstract setVar(id: string, value: FlexibleItem): void;

    abstract sequenceFromInsertionPoint(ins: InsertionPoint): ISequence;

    abstract noteFromInsertionPoint(ins: InsertionPoint): Note;

    abstract domainConverter: DomainConverter<VoiceContentDef, MusicEvent[]>;

    abstract insertElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void;

    abstract appendElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent): void;

    abstract setProject(lens: ProjectLens, lensItem: LensItem): void;
    abstract overProject(lens: ProjectLens, noteConverter: (fromNote: LensItem) => LensItem): void;

    abstract createProjectLens(ins: InsertionPoint): ProjectLens;

    replaceNoteAtInsertionPoint(ins: InsertionPoint, noteConverter: (fromNote: LensItem) => LensItem): void {
        
        const lens = this.createProjectLens(ins);
        this.overProject(lens, noteConverter);

    }

    deleteNoteAtInsertionPoint(ins: InsertionPoint, fromNote: Note): void {
        
        const lens = this.createProjectLens(ins);
        this.setProject(lens, lensItemNone);

    }

    //abstract pitchFromInsertionPoint(ins: InsertionPoint): Pitch;

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

    getView(varname?: string): EditableView {
        if (varname) {
            return new JMusic({content: [[valueOf(this.vars, varname).elements]]});
        }
        return this;
    }

}