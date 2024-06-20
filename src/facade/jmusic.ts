import { MusicSelection } from './../selection/selection-types';
import { DomainConverter, LensItem, Model, ProjectLens, VarDictFlex, VoiceContentDef } from '../model';
import { ISequence, MusicEvent } from './../model/score/sequence';
import { InsertionPoint, InsertionPointDef } from '../editor/insertion-point';
import { Key } from '../model/states/key';
import { Clef } from '../model/states/clef';
import { RepeatDef } from '../model/score/repeats';
import { Staff } from '../model/score/staff';
import { ScoreDef } from '../model';
import { Meter } from '../model/states/meter';
import { Note } from '../model/notes/note';
import { VariableRepository } from '../model/score/variables';
import R = require('ramda');
import { FlexibleItem, ProjectDef } from '../model';
import { ProjectFlex } from '../model/facade/project-flex';
import { EditView, EditableView } from '../model/facade/views';
import { VariableView } from '../model/facade/variable-view';

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

export const initStateInMultiSequence = (s: ISequence[]) => {
    return s.reduce((prev, curr) => { return { prev, ... initStateInSequence(curr) }; }, {} as any);
};

/** Facade object for music scores */
export class JMusic extends EditView implements EditableView {

    model: Model;

    constructor(scoreFlex?: ProjectFlex, vars?: VarDictFlex) {
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

    createProjectLens(ins: InsertionPoint): ProjectLens<LensItem> {
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

    overProject<T>(lens: ProjectLens<T>, noteConverter: (fromNote: T) => T): void {
        this.model.overProject(lens, noteConverter);
    }

    modifyProject(modifier: (elm: MusicEvent) => MusicEvent[], selection: MusicSelection): void {
        this.model.modifyProject(modifier, selection);
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