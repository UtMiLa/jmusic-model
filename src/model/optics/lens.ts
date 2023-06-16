import { VariableRepository } from './../score/variables';
import { ISequence, MusicEvent, isNote } from '../score/sequence';
import R = require('ramda');
import { ProjectDef } from '../score/types';
import { voiceContentToSequence, voiceSequenceToDef } from '../score/voice';
import { FlexibleSequence, simplifyDef } from '../score/flexible-sequence';
import { AbsoluteTime, Time } from '../rationals/time';
import { lookupVariable } from '../score/variables';

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
            new FlexibleSequence(pd.score.staves[timed.staff].voices[timed.voice].content, new VariableRepository(pd.vars)), 
            timed.time, 
            timed.eventFilter
        )
    };
}


/*
const modifySequenceByIndex = (seq: FlexibleSequence, atIndex: AbsoluteTime, item: MusicEvent) => R.chain(
    (ct, index) => {
        return [index === atIndex && isNote(ct) ? item : ct];
    },
    seq.elements
);
*/


export function projectLensByIndex(index: NaturalLensIndex): ProjectLens {

    if (isVarIndex(index)) {
        return R.lens(
            (pd: ProjectDef) => voiceContentToSequence(new FlexibleSequence(lookupVariable(pd.vars, index.variable)).asObject, new VariableRepository(pd.vars)).elements[index.element],
            (a: MusicEvent, pd: ProjectDef) => (
                {
                    ...pd, 
                    vars: [
                        ...pd.vars.map(v => {
                            if (v.id === index.variable) {
                                return {
                                    id: index.variable,
                                    value: voiceSequenceToDef(
                                        new FlexibleSequence(voiceContentToSequence(new FlexibleSequence(v.value).asObject, new VariableRepository(pd.vars)).elements.map((value, i) => i === index.element ? a : value))
                                    )
                                };
                            } else {
                                return v;
                            }
                        })
                    ] 
                }                
            )
        );
    
    } else {
        return R.lens(
            (pd: ProjectDef) => voiceContentToSequence(pd.score.staves[index.staff].voices[index.voice].content, new VariableRepository(pd.vars)).elements[index.element],
            (a: MusicEvent, pd: ProjectDef) => {
                const seq = new FlexibleSequence(pd.score.staves[index.staff].voices[index.voice].content, new VariableRepository(pd.vars));
                const path = seq.indexToPath(index.element);
                //console.log(path);

                path.pop();

                if (path.length && typeof path[0] === 'string') {
                    // var reference
                    const val = pd.vars.map(item => item.id === path[0] 
                        ? { id: item.id, value: R.assocPath(path.slice(1), simplifyDef(a), new FlexibleSequence(item.value).asObject) }
                        : item);
                    return R.assoc('vars', val, pd);
                }

                return R.assocPath(['score', 'staves', index.staff, 'voices', index.voice, 'content', ...path], simplifyDef(a), pd);

                /*return {
                    ...pd, 
                    score: { 
                        ...pd.score, 
                        staves: pd.score.staves.map((staff, staffIndex) => staffIndex === index.staff ? {
                            ...staff, 
                            voices: staff.voices.map((voice, voiceIndex) => voiceIndex === index.voice ? {
                                ...voice, 
                                content: voiceSequenceToDef(
                                    new FlexibleSequence(voiceContentToSequence(voice.content).elements.map((value, i) => i === index.element ? a : value))
                                )
                            } : voice)
                        } : staff) 
                    }
                };*/
            }
        );
                    
    
    }

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
