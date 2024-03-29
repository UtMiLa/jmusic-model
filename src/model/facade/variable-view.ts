import { Staff, staffDefToStaff } from './../score/staff';
import { InsertionPoint, InsertionPointDef } from '../../editor/insertion-point';
import { ChangeHandler, Clef, FlexibleSequence, JMusic, voiceContentToSequence, voiceSequenceToDef } from '..';
import { TupletState, NoteDirection, Note } from '../notes/note';
import { NoteExpression } from '../notes/note-expressions';
import { DomainConverter, ProjectLens, LensItem, projectLensByIndex, lensItemNone } from '../optics/lens';
import { Pitch } from '../pitches/pitch';
import { RationalDef } from '../rationals/rational';
import { TimeSpan } from '../rationals/time';
import { ISequence, SequenceDef, MusicEvent } from '../score/sequence';
import { FlexibleItem } from '../score/types';
import { VariableRepository, valueOf } from '../score/variables';
import { EditView, EditableView } from './views';
import { makeScore } from './score-flex';
import R = require('ramda');
import { createStateMap, getStateAt } from '~/logical-view/view-model/state-map';

export class VariableView extends EditView implements EditableView {
    constructor(private parent: JMusic, private variableName: string) {
        super();
        this.staves = makeScore({content: [[valueOf(this.parent.vars, variableName).elements]]}, this.parent.vars).staves.map(staffDef => staffDefToStaff(staffDef, this.vars));
        this.vars = parent.vars;
        this.onChanged(() => {
            this.staves = makeScore({content: [[valueOf(this.parent.vars, this.variableName).elements]]}, this.parent.vars).staves.map(staffDef => staffDefToStaff(staffDef, this.vars));        
        });
    }

    changeHandlers: ChangeHandler[] = [];
    staves: Staff[];

    vars: VariableRepository;

    createProjectLens(ins: InsertionPoint): ProjectLens {
        const insertion = new InsertionPoint(this); // awkward
        const element = insertion.findIndex(ins.time);
        return projectLensByIndex(this.domainConverter, {
            variable: this.variableName,
            element
        });
    }

    setVar(id: string, value: FlexibleItem): void {
        throw new Error('Method not implemented.');
    }
    sequenceFromInsertionPoint(ins: InsertionPoint): ISequence {
        throw new Error('Method not implemented.');
    }
    noteFromInsertionPoint(ins: InsertionPoint): Readonly<{ pitches: Pitch[]; nominalDuration: TimeSpan; tupletFactor?: RationalDef | undefined; tupletGroup?: TupletState | undefined; direction: NoteDirection; tie?: boolean | undefined; uniq?: string | undefined; expressions?: NoteExpression[] | undefined; text?: string[] | undefined; grace?: boolean | undefined; }> {
        throw new Error('Method not implemented.');
    }
    get domainConverter(): DomainConverter<SequenceDef, MusicEvent[]> {
        return {
            fromDef: def => voiceContentToSequence(def, this.vars).elements,
            toDef: events => voiceSequenceToDef(new FlexibleSequence(events, this.vars))
        };
    }
    insertElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void {
        throw new Error('Method not implemented.');
    }
    appendElementAtInsertionPoint(ins: InsertionPointDef, element: MusicEvent): void {
        throw new Error('Method not implemented.');
    }
    setProject(lens: ProjectLens, lensItem: LensItem): void {
        this.parent.setProject(lens, lensItem);        
        this.didChange();
    }
    overProject(lens: ProjectLens, noteConverter: (fromNote: LensItem) => LensItem): void {
        this.parent.overProject(lens, noteConverter);
        this.didChange();
    }


}