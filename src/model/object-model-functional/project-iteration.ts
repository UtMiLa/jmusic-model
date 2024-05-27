import { Score } from './../score/score';
import { Selection, SelectionManager } from './../../selection/selection-types';
import { array, option } from 'fp-ts';
import { MusicEvent, isMusicEvent } from '../score/sequence';
import { ActiveProject, ActiveSequenceItem, ActiveStaff, ActiveVoice, ElementDescriptor } from './types';
import { activeGetElements, activeGetPositionedElements } from './conversions';
import { pipe } from 'fp-ts/lib/function';

export function getProjectElements(project: ActiveProject): ElementDescriptor[] {
    const events = array.chainWithIndex((staffNo: number, staff: ActiveStaff) => { 
        return pipe(staff.voices,
            array.chainWithIndex((voiceNo: number, voice: ActiveVoice) => {
                return pipe(
                    activeGetPositionedElements(voice.content), 
                    array.map((elem: ElementDescriptor) => ({
                        element: elem.element,
                        position: { ...elem.position, staffNo, voiceNo } 
                    }))
                );
            })
        );
    })(project.score.staves);
    return events;
}

export const getSelected = (selection: Selection) => (elements: ElementDescriptor[]): ElementDescriptor[] => {
    return elements.filter(element => selection.isSelected(element.position));
};


export const modifyProject = (modifier: (x: MusicEvent) => MusicEvent[]) => (project: ActiveProject): ActiveProject => {

    const newProject = {
        score: {
            ...project.score,
            staves: project.score.staves.map(
                staff => ({
                    ...staff,
                    voices: staff.voices.map(
                        voice => ({
                            ...voice,
                            content: array.chain((e: ActiveSequenceItem) => isMusicEvent(e as MusicEvent) ? modifier(e as MusicEvent) : [e])(voice.content)
                        })
                    )
                })
            )
        },
        vars: project.vars
    };
    
    return newProject;
};

