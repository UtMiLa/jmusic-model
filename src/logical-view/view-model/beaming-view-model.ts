import { AbsoluteTime } from './../../model/rationals/time';

export interface NoteRef {
    absTime: AbsoluteTime;
    uniq: string;    
}

export interface BeamDef {
    fromIdx: number;
    toIndex: number;
}

export interface BeamingViewModel {
    noteRefs: NoteRef[];    
    beams: BeamDef[];
}