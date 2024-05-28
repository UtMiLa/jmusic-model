import { Score } from './../score/score';
import { ElementIdentifier, Selection, SelectionManager } from './../../selection/selection-types';
import { array, option, record, string } from 'fp-ts';
import { MusicEvent, isMusicEvent } from '../score/sequence';
import { ActiveProject, ActiveSequence, ActiveSequenceItem, ActiveStaff, ActiveVoice, ElementDescriptor } from './types';
import { activeGetElements, activeGetPositionedElements, indexToPath } from './conversions';
import { pipe } from 'fp-ts/lib/function';
import R = require('ramda');
import { PathElement } from '../score/flexible-sequence';

export function getProjectElements(project: ActiveProject): ElementDescriptor[] {
    const events = array.chainWithIndex((staffNo: number, staff: ActiveStaff) => { 
        return pipe(staff.voices,
            array.chainWithIndex((voiceNo: number, voice: ActiveVoice) => {
                return pipe(
                    activeGetPositionedElements(voice.content), 
                    array.map((elem: ElementDescriptor) => {
                        const position = { ...elem.position, staffNo, voiceNo };
                        return {
                            element: elem.element,
                            path: indexToPath(project, {...elem, position}),
                            position: position
                        };
                    })
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

    const items = getProjectElements(project);
    const changes = items.map(item => {
        return {
            ref: item,
            changeTo: modifier(item.element)
        };
    });

    const modifySeq = (path: PathElement<MusicEvent>[]) => array.chainWithIndex((elementNo, e: ActiveSequenceItem) => {
        const findChanges = changes.find(change => R.equals<PathElement<MusicEvent>[]>(change.ref.path, [...path, elementNo, 0]));
        if (findChanges) {
            return findChanges.changeTo;    
        }
        return [e];
    });

    const newProject = {
        score: {
            ...project.score,
            staves: project.score.staves.map(
                (staff, staffNo) => ({
                    ...staff,
                    voices: staff.voices.map(
                        (voice, voiceNo) => ({
                            ...voice,
                            content: modifySeq(['score', 'staves', staffNo, 'voices', voiceNo, 'content'])(voice.content)
                            /*array.chainWithIndex((elementNo, e: ActiveSequenceItem) => {
                                const findChanges = changes.find(change => R.equals<PathElement<MusicEvent>[]>(change.ref.path, ['score', 'staves', staffNo, 'voices', voiceNo, 'content', elementNo, 0]));
                                if (findChanges) {
                                    return findChanges.changeTo;    
                                }
                                modifySeq(['score', 'staves', staffNo, 'voices', voiceNo, 'content', elementNo, 0])(voice.content);
                            })(voice.content)*/
                        })
                    )
                })
            )
        },
        vars: record.mapWithIndex<string, ActiveSequence, ActiveSequence>((varName: string, seq) => {
            return modifySeq([{ variable: varName } ])(seq);
        })(project.vars)
    };
    
    return newProject;
};

