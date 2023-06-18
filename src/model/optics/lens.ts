import { VariableRepository, createRepo } from './../score/variables';
import { ISequence, MusicEvent, isNote } from '../score/sequence';
import R = require('ramda');
import { FlexibleItem, ProjectDef, VariableDef } from '../score/types';
import { voiceContentToSequence, voiceSequenceToDef } from '../score/voice';
import { FlexibleSequence, PathElement, simplifyDef } from '../score/flexible-sequence';
import { AbsoluteTime, Time } from '../rationals/time';
import { lookupVariable } from '../score/variables';
import { ScoreDef } from '../score/score';

export type ProjectLens = R.Lens<ProjectDef, MusicEvent>;

export interface NaturalLensIndexScore {
    staff: number;
    voice: number;
    element: number;
}

export interface NaturalLensIndexVariable {
    variable: string;
    element: number;
}

export type NaturalLensIndex = NaturalLensIndexScore | NaturalLensIndexVariable

export interface TimeLensIndex {
    staff: number;
    voice: number;
    time: AbsoluteTime;
    eventFilter: (event: MusicEvent) => boolean;
}

function isVarIndex(idx: NaturalLensIndex): idx is NaturalLensIndexVariable {
    return !!(idx as NaturalLensIndexVariable).variable;
}

function isScoreIndex(idx: NaturalLensIndex): idx is NaturalLensIndexScore {
    return !!(idx as NaturalLensIndexScore).staff;
}

const modifySequenceByTime = (seq: FlexibleSequence, atTime: AbsoluteTime, item: MusicEvent) => seq.chainElements(
    (ct, time) => {
        return [Time.equals(time, atTime) && isNote(ct) ? item : ct];
    }
);

function getElementIndex(seq: ISequence, time: AbsoluteTime, eventFilter: (event: MusicEvent) => boolean): number {
    return seq.indexOfTime(time);
}

function timedToIndex(pd: ProjectDef, timed: TimeLensIndex): NaturalLensIndex {
    return {
        staff: timed.staff,
        voice: timed.voice,
        element: getElementIndex(
            new FlexibleSequence(pd.score.staves[timed.staff].voices[timed.voice].content, createRepo(pd.vars)), 
            timed.time, 
            timed.eventFilter
        )
    };
}


export function projectLensByIndex(index: NaturalLensIndex): ProjectLens {

    if (isVarIndex(index)) {
        return varLensByIndex(index);
    } else {
        return voiceLensByIndex(index);
    }

}


function voiceLensByIndex(index: NaturalLensIndexScore): ProjectLens {
    return R.lens(
        sequencsElementGetter(index),
        sequencsElementSetter(index)
    );
}

function isVarPath(path: PathElement[]): boolean
{
    return !!path.length && typeof path[0] === 'string';
}

function sequencsElementSetter(index: NaturalLensIndexScore): (a: MusicEvent, s: ProjectDef) => ProjectDef {
    return (a: MusicEvent, pd: ProjectDef) => {
        const seq = new FlexibleSequence(pd.score.staves[index.staff].voices[index.voice].content, createRepo(pd.vars));
        const path = seq.indexToPath(index.element);
        //console.log(path);
        path.pop(); // todo: remove annoying last 0 from path

        if (isVarPath(path)) {
            // var reference
            const val = pd.vars.map(item => item.id === path[0]
                ? { id: item.id, value: R.assocPath(path.slice(1), simplifyDef(a), new FlexibleSequence(item.value).asObject) }
                : item);
            return R.assoc('vars', val, pd);
        }

        return R.assocPath(['score', 'staves', index.staff, 'voices', index.voice, 'content', ...path], simplifyDef(a), pd);

    };
}

function sequencsElementGetter(index: NaturalLensIndexScore): (s: ProjectDef) => MusicEvent {
    return (pd: ProjectDef) => voiceContentToSequence(pd.score.staves[index.staff].voices[index.voice].content, createRepo(pd.vars)).elements[index.element];
}

function varLensByIndex(index: NaturalLensIndexVariable): ProjectLens {
    return R.lens(
        varGetter(index),
        varSetter(index)
    );
}

function changeVarInRepo(varName: string, valueChanger: (f: FlexibleItem) => FlexibleItem, repo: VariableDef[]): VariableDef[] {
    return repo.map(v => {
        if (v.id === varName) {
            return { id: varName, value: valueChanger(v.value)  };
        } else {
            return v;
        }
    });
}

function varSetter(index: NaturalLensIndexVariable): (a: MusicEvent, s: { vars: VariableDef[]; score: ScoreDef; }) => { vars: VariableDef[]; score: ScoreDef; } {
    return (a: MusicEvent, pd: ProjectDef) => (
        {
            ...pd,
            vars: changeVarInRepo(index.variable, v => setModifiedVar(index, v, pd, a), pd.vars)
        }
    );
}

function elementsToDef(elements: MusicEvent[]): FlexibleItem {
    return voiceSequenceToDef(new FlexibleSequence(elements));
}

function setModifiedVar(index: NaturalLensIndexVariable, value: FlexibleItem, pd: ProjectDef, a: MusicEvent): FlexibleItem {
    return elementsToDef(
        new FlexibleSequence(value, createRepo(pd.vars))
            .elements.map(
                (value, i) => i === index.element ? a : value
            )
    );    
}

function varGetter(index: NaturalLensIndexVariable): (s: { vars: VariableDef[]; score: ScoreDef; }) => MusicEvent {
    return (pd: ProjectDef) => voiceContentToSequence(new FlexibleSequence(lookupVariable(pd.vars, index.variable)).asObject, createRepo(pd.vars)).elements[index.element];
}

export function projectLensByTime(index: TimeLensIndex): ProjectLens {
    // get seq
    // find index from time
    // call projectLensByIndex
    return R.lens(
        (pd: ProjectDef) => R.view(projectLensByIndex(timedToIndex(pd, index)), pd),
        (a: MusicEvent, pd: ProjectDef) => R.set(projectLensByIndex(timedToIndex(pd, index)), a, pd)
    ) ;
}
