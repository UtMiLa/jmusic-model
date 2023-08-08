import { DomainConverter, LensItem, ProjectLens, VoiceContentDef, cloneNote, doWithNote, lensItemNone, lensItemOf, projectLensByTime, voiceContentToSequence, voiceSequenceToDef } from '../../model';
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

    constructor(scoreFlex?: ProjectFlex, vars?: VarDict) {
        super();

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

    createProjectLens(ins: InsertionPoint): ProjectLens {
        return projectLensByTime(this.domainConverter, { staff: ins.staffNo, voice: ins.voiceNo, time: ins.time, eventFilter: isNote });
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

    get domainConverter(): DomainConverter<VoiceContentDef, MusicEvent[]> {
        return {
            fromDef: def => voiceContentToSequence(def, this.vars).elements,
            toDef: events => voiceSequenceToDef(new FlexibleSequence(events, this.vars))
        };
    }

    setProject(lens: ProjectLens, lensItem: LensItem): void {
        this.project = R.set(lens, lensItem, this.project);
    }
    overProject(lens: ProjectLens, noteConverter: (fromNote: LensItem) => LensItem): void {
        this.project = R.over(lens, noteConverter, this.project);
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

    onChanged(handler: ChangeHandler): void {        
        this.changeHandlers.push(handler);
    }

    didChange(): void {
        this.changeHandlers.forEach(handler => handler());
    }

    getView(varname?: string): EditableView {
        if (varname) {
            //return new JMusic({content: [[valueOf(this.vars, varname).elements]]});
            return new VariableView(this, varname);
        }
        return this;
    }

}