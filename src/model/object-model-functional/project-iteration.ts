import { array } from 'fp-ts';
import { MusicEvent } from '../score/sequence';
import { ActiveProject, ActiveStaff, ActiveVoice, ElementDescriptor } from './types';
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