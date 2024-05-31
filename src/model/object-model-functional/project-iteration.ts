import { Selection } from './../../selection/selection-types';
import { array, record } from 'fp-ts';
import { MusicEvent } from '../score/sequence';
import { ActiveFunctionCall, ActiveProject, ActiveSequence, ActiveSequenceItem, ActiveStaff, ActiveVoice, ElementDescriptor, isActiveFunctionCall } from './types';
import { activeGetPositionedElements, indexToPath } from './conversions';
import { pipe } from 'fp-ts/lib/function';
import R = require('ramda');
import { PathElement } from '../score/flexible-sequence';
import { createFunction, createInverseFunction } from '../score/functions';

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




export const modifyProject = (modifier: (x: MusicEvent) => MusicEvent[], selection?: Selection) => (project: ActiveProject): ActiveProject => {

    const items = getProjectElements(project);
    const changes = array.chain((item: ElementDescriptor) => {
        if (selection && !selection.isSelected(item.position)) return [];
        return [item];
    })(items);

    const matchPath = (path1: PathElement<MusicEvent>[], path2: PathElement<MusicEvent>[]): boolean => {
        return R.equals<PathElement<MusicEvent>[]>(path1, path2); // todo: replace function refs
    };

    const modifyFunctionCall = (
        path: PathElement<MusicEvent>[], 
        changes: ElementDescriptor[], 
        modifier: (x: MusicEvent) => MusicEvent[],
        elementNo: number, 
        e: ActiveFunctionCall) => 
    {

        // * iterate over e's elements (recursive modifySeq([...path, 'args']))
        // * somehow find a matching change
        // * replace using function/inverse
        // * return modified function args

        const functionPath = [...path, elementNo, 'args'];
        const fUp = (x: MusicEvent[]): MusicEvent[] => { 
            const result = createFunction(e.name, e.extraArgs)(x);
            //console.log('fUp', (x as any)[0].pitches, (result as any)[0].pitches); 
            return result;
        };
        const fDown = (x: MusicEvent[]): MusicEvent[] => { 
            const result = createInverseFunction(e.name, e.extraArgs)(x);
            //console.log('fDown', (x as any)[0].pitches, (result as any)[0].pitches); 
            return result;
        };
            //const fDown = createInverseFunction(e.name, e.extraArgs);
        const newModifier = (x: MusicEvent) => fDown(array.chain(modifier)(fUp([x])));
        const newArgs = modifySeq(functionPath, changes, newModifier)(e.items); // todo: figure out how function and inverseFunction works on selected/unselected items
        //const elems = (activeGetElements(newArgs)); // todo: take care of nested functions
        return [{
            ...e,
            items: newArgs
        } as ActiveFunctionCall]; // recalc ActiveFunctionCall.duration

    };

    const modifySeq = (
        path: PathElement<MusicEvent>[], 
        changes: ElementDescriptor[], 
        modifier: (x: MusicEvent) => MusicEvent[]
    ) => array.chainWithIndex((elementNo, e: ActiveSequenceItem): ActiveSequence => 
    {
        if (isActiveFunctionCall(e)) {
            return modifyFunctionCall(path, changes, modifier, elementNo, e);
        }
        const findChanges = changes.find(change => matchPath(change.path, [...path, elementNo]));
        if (findChanges) {
            return modifier(e as MusicEvent);    
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
                            content: modifySeq(['score', 'staves', staffNo, 'voices', voiceNo, 'content'], changes, modifier)(voice.content)
                        })
                    )
                })
            )
        },
        vars: record.mapWithIndex<string, ActiveSequence, ActiveSequence>((varName: string, seq) => 
            modifySeq([{ variable: varName }], changes, modifier)(seq))(project.vars)
    };
    
    return newProject;
};

