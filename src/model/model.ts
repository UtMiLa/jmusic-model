import { ElementIdentifier, MusicSelection } from './../selection/selection-types';
import R = require('ramda');
import { InsertionPoint, InsertionPointDef } from '../editor/insertion-point';
import { ChangeHandler } from '.';
import { Note } from './notes/note';
import { ProjectLens, projectLensByTime, DomainConverter, LensItem } from './optics/lens';
import { Time } from './rationals/time';
import { flexibleItemToDef } from './score/flexible-sequence';
import { RepeatDef } from './score/repeats';
import { ISequence, isNote, MusicEvent } from './score/sequence';
import { Staff } from './score/staff';
import { ProjectDef, FlexibleItem } from '.';
import { VariableRepository, createRepo, varDictActiveToDef, varDictFlexToActive } from './score/variables';
import { VoiceContentDef } from '.';
import { activeGetElements, convertSequenceDataToActive } from './active-project/conversions';
import { ActiveProject } from './active-project/types';
import { convertProjectDataToActive } from './active-project/def-to-active';
import { modifyProject } from './active-project/project-iteration';
import { SelectionBy, SelectionInsertionPoint } from '../selection/query';
import { convertProjectActiveToData } from './active-project/active-to-def';
import { SimpleActiveSequence } from './active-project/simple-active-sequence';


export class Model {
    constructor(score: ActiveProject) {
        this.activeProject = score;
    }

    get project(): ProjectDef {
        return convertProjectActiveToData(this.activeProject);
    }

    activeProject: ActiveProject;

    public get staves(): Staff[] {
        return this.activeProject.score.staves.map(staff => ({...staff, voices: staff.voices.map(voice => ({
            ...voice, content: new SimpleActiveSequence(voice.content)
        })) }));
    }

    public get repeats(): RepeatDef[] | undefined {
        return this.activeProject.score.repeats;
    }

    public get vars(): VariableRepository {
        return createRepo(varDictActiveToDef(this.activeProject.vars));
    }

    changeHandlers: ChangeHandler[] = [];

    setVar(id: string, value: FlexibleItem): void {
        this.activeProject.vars = { 
            ...this.activeProject.vars, 
            ...varDictFlexToActive({[id]: value})            
        };
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

    modifyProject(modifier: (elm: MusicEvent) => MusicEvent[], selection: MusicSelection): void {
        this.activeProject = modifyProject(modifier, selection)(this.activeProject);
    }

    insertElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void {
        this.modifyProject(elm => {
            if (checkType(elm)) return [];
            return isNote(elm) ? [element, elm] : [elm];
        }, new SelectionInsertionPoint(ins));
    }

    appendElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent): void {
        
        this.modifyProject(elm => {
            return [elm, element];
        }, new SelectionBy((element: ElementIdentifier) => 
            element.staffNo === ins.staffNo && 
            element.voiceNo === ins.voiceNo && 
            element.elementNo === this.staves[ins.staffNo].voices[ins.voiceNo].content.elements.length - 1 // todo: make nicer
        ));

    }

    get domainConverter(): DomainConverter<VoiceContentDef, MusicEvent[]> {
        return {
            fromDef: def => activeGetElements(convertSequenceDataToActive(def, this.vars.vars)),
            toDef: events => flexibleItemToDef(events)
        };
    }

    /*get activeDomainConverter(): DomainConverter<ActiveSequence, MusicEvent[]> {
        return {
            fromDef: def => activeGetElements(def),
            toDef: events => flexibleItemToDef(events)
        };
    }*/

    overProject<T>(lens: ProjectLens<T>, noteConverter: (fromNote: T) => T): void {

        const activeLens = R.lens<ActiveProject, T>(
            (s: ActiveProject) => R.view(lens, convertProjectActiveToData(s)),
            (a: T, s: ActiveProject) => convertProjectDataToActive(R.set(lens, a, convertProjectActiveToData(s)))
        );

        this.activeProject = R.over(activeLens, noteConverter, this.activeProject);
    }


    clearScore(resetTo: ProjectDef): void {

        this.activeProject = convertProjectDataToActive(resetTo);

        this.didChange();
    }

    addRepeat(repeat: RepeatDef): void {
        if (!this.activeProject.score.repeats)
            this.activeProject.score.repeats = [];
        this.activeProject.score.repeats?.push(repeat);
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