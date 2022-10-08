import { NoteType, NoteDirection } from '../../model';
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


export enum FlagType {
    None,
    F1,
    F2,
    F3,
    F4,
    F5,
    Beam
}
export interface NoteViewModel {
    positions: number[];
    noteType: NoteType;
    direction: NoteDirection;
    flagType?: FlagType;
    dotNo?: number;
    uniq?: string;
}

