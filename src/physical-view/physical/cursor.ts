import { Pitch } from './../../model/pitches/pitch';
import { AbsoluteTime } from './../../model/rationals/time';

export interface Cursor {
    absTime: AbsoluteTime;
    position: number;
    staff: number;
}