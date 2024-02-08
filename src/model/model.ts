import R = require('ramda');
import { InsertionPoint, InsertionPointDef } from '../editor/insertion-point';
import { ChangeHandler, JMusicSettings } from '.';
import { ProjectFlex, makeProject } from './facade/project-flex';
import { Note } from './notes/note';
import { ProjectLens, projectLensByTime, DomainConverter, LensItem } from './optics/lens';
import { Time } from './rationals/time';
import { FlexibleSequence } from './score/flexible-sequence';
import { RepeatDef } from './score/repeats';
import { ScoreDef } from './score/score';
import { ISequence, isNote, MusicEvent } from './score/sequence';
import { Staff, staffDefToStaff } from './score/staff';
import { VarDict, ProjectDef, FlexibleItem } from './score/types';
import { VariableRepository, createRepo, setVar } from './score/variables';
import { voiceSequenceToDef, VoiceContentDef, voiceContentToSequence } from './score/voice';


export class Model {
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
            fromDef: def => voiceContentToSequence(def, this.vars)[0].elements, // todo: correct voiceNo
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