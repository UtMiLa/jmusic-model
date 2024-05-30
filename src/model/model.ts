import R = require('ramda');
import { InsertionPoint, InsertionPointDef } from '../editor/insertion-point';
import { ChangeHandler, JMusicSettings } from '.';
import { ProjectFlex, makeProject } from './facade/project-flex';
import { Note } from './notes/note';
import { ProjectLens, projectLensByTime, DomainConverter, LensItem } from './optics/lens';
import { Time } from './rationals/time';
import { FlexibleSequence, flexibleItemToDef } from './score/flexible-sequence';
import { RepeatDef } from './score/repeats';
import { ScoreDef } from '.';
import { ISequence, isNote, MusicEvent } from './score/sequence';
import { Staff, staffDefToStaff } from './score/staff';
import { VarDict, ProjectDef, FlexibleItem } from '.';
import { VariableRepository, createRepo, setVar } from './score/variables';
import { voiceSequenceToDef, VoiceContentDef, voiceContentToSequence } from '.';
import { activeGetElements, convertSequenceDataToActive } from './object-model-functional/conversions';
import { ActiveProject } from './object-model-functional/types';
import { convertProjectDataToActive } from './object-model-functional/def-to-active';


export class Model {
    constructor(scoreFlex?: ProjectFlex, vars?: VarDict) {
        this.project = makeProject(scoreFlex, vars);
        this.activeProject = convertProjectDataToActive(this.project);
    }

    project: ProjectDef;
    activeProject: ActiveProject;

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

    createProjectLens(ins: InsertionPointDef): ProjectLens<LensItem> {
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
        this.project = R.set(R.lensPath(['score', 'staves', ins.staffNo, 'voices', ins.voiceNo, 'contentDef']), new FlexibleSequence([
            ...this.staves[ins.staffNo].voices[ins.voiceNo].content.elements,
            element
        ], this.vars).asObject, this.project);
        
        /*this.project.score.staves[ins.staffNo].voices[ins.voiceNo].contentDef = 
            [
                ...this.staves[ins.staffNo].voices[ins.voiceNo].content.elements,
                element
            ]
        ;*/
    }

    get domainConverter(): DomainConverter<VoiceContentDef, MusicEvent[]> {
        return {
            fromDef: def => activeGetElements(convertSequenceDataToActive(def, this.vars.vars)),// todo: correct voiceNo
            toDef: events => flexibleItemToDef(events)
        };
    }

    setProject(lens: ProjectLens<LensItem>, lensItem: LensItem): void {
        this.project = R.set(lens, lensItem, this.project);
    }
    overProject<T>(lens: ProjectLens<T>, noteConverter: (fromNote: T) => T): void {
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
/*
    getView(varname?: string): EditableView {
        if (varname) {
            //return new JMusic({content: [[valueOf(this.vars, varname).elements]]});
            return new VariableView(this, varname);
        }
        return this;
    }
*/
}