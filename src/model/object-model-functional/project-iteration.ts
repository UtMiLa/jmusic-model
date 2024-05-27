import { array } from 'fp-ts';
import { MusicEvent } from '../score/sequence';
import { ActiveProject, ActiveStaff, ActiveVoice } from './types';
import { activeGetElements } from './conversions';

export function getProjectElements(project: ActiveProject): MusicEvent[] {
    const events = array.chain((staff: ActiveStaff) => { 
        return array.chain((voice: ActiveVoice) => {
            return activeGetElements(voice.content);
        }) (staff.voices);
    })(project.score.staves);
    return events;
}