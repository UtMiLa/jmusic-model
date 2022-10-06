import { BeamDef } from '../../model/notes/beaming';
import { AbsoluteTime } from './../../model/rationals/time';

export interface NoteRef {
    absTime: AbsoluteTime;
    uniq: string;    
}


export interface BeamingViewModel {
    noteRefs: NoteRef[];    
    beams: BeamDef[];
}