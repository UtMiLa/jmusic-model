import { MusicEvent, isNote } from '../score/sequence';
import R = require('ramda');
import { ProjectDef } from '../score/types';
import { voiceContentToSequence, voiceSequenceToDef } from '../score/voice';
import { FlexibleSequence } from '../score/flexible-sequence';
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
            (pd: ProjectDef) => voiceContentToSequence(new FlexibleSequence(lookupVariable(pd.vars, index.variable)).asObject).elements[index.element],
            (a: MusicEvent, pd: ProjectDef) => (
                {
                    ...pd, 
                    vars: [
                        ...pd.vars.map(v => {
                            if (v.id === index.variable) {
                                return {
                                    id: index.variable,
                                    value: voiceSequenceToDef(
                                        new FlexibleSequence(voiceContentToSequence(new FlexibleSequence(v.value).asObject).elements.map((value, i) => i === index.element ? a : value))
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
            (pd: ProjectDef) => voiceContentToSequence(pd.score.staves[index.staff].voices[index.voice].content).elements[index.element],
            (a: MusicEvent, pd: ProjectDef) => (
                {
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
                        } : staff) }})
        );
    
    }

}