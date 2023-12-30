import { DomainConverter, LensItem, Model, ProjectLens, VoiceContentDef, cloneNote, doWithNote, lensItemNone, lensItemOf, projectLensByTime, voiceContentToSequence, voiceSequenceToDef } from '../../model';
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
import { EditView, EditableView } from './views';
import { VariableView } from './variable-view';

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
export class JMusic extends EditView implements EditableView {

    model: Model;

    constructor(scoreFlex?: ProjectFlex, vars?: VarDict) {
        super();

        this.model = new Model(scoreFlex, vars);
    }

    get project(): ProjectDef { return this.model.project; }

    public get staves(): Staff[] {
        return this.model.staves;
    }

    public get repeats(): RepeatDef[] | undefined {
        return this.model.repeats;
    }

    public get vars(): VariableRepository {
        return this.model.vars;
    }

    get changeHandlers(): ChangeHandler[] { return this.model.changeHandlers; }

    setVar(id: string, value: FlexibleItem): void {
        this.model.setVar(id, value);
    }

    sequenceFromInsertionPoint(ins: InsertionPoint): ISequence {
        return this.model.sequenceFromInsertionPoint(ins);
    }

    noteFromInsertionPoint(ins: InsertionPoint): Note {
        return this.model.noteFromInsertionPoint(ins);
    }

    createProjectLens(ins: InsertionPoint): ProjectLens {
        return this.model.createProjectLens(ins);
    }

    insertElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void {
        this.model.insertElementAtInsertionPoint(ins, element, checkType);
    }

    appendElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent): void {
        this.model.appendElementAtInsertionPoint(ins, element);
    }

    get domainConverter(): DomainConverter<VoiceContentDef, MusicEvent[]> {
        return this.model.domainConverter;
    }

    setProject(lens: ProjectLens, lensItem: LensItem): void {
        this.model.setProject(lens, lensItem);
    }
    overProject(lens: ProjectLens, noteConverter: (fromNote: LensItem) => LensItem): void {
        this.model.overProject(lens, noteConverter);
    }


    clearScore(ins: InsertionPoint, voice?: string | JMusicSettings | ScoreDef): void {
        this.model.clearScore(ins, voice);
    }

    addRepeat(repeat: RepeatDef): void {
        this.model.addRepeat(repeat);
    }

    onChanged(handler: ChangeHandler): void {      
        this.model.onChanged(handler);
    }

    didChange(): void {
        this.model.didChange();
    }

    getView(varname?: string): EditableView {
        if (varname) {
            //return new JMusic({content: [[valueOf(this.vars, varname).elements]]});
            return new VariableView(this, varname);
        }
        return this;
    }

}