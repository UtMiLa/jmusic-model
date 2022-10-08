import { BeamingViewModel } from './note-view-model';
import { Alteration } from './../../model/pitches/pitch';
import { MeterViewModel } from './convert-meter';
import { AbsoluteTime } from './../../model';
import { KeyViewModel } from './convert-key';
import { NoteViewModel } from './note-view-model';
import { ClefType } from '../../model';
import { NoteDirection } from '../../model';

export interface ClefViewModel {
    position: number;
    clefType: ClefType;
    line: number;
}

export interface TieViewModel { 
    position: number; 
    direction: NoteDirection;
    toTime?: AbsoluteTime;
}

export interface AccidentalViewModel {
    position: number;
    alteration: Alteration;
    displacement: number;
}
export interface TimeSlotViewModel {
    absTime: AbsoluteTime; 
    clef?: ClefViewModel;
    key?: KeyViewModel;
    meter?: MeterViewModel;
    bar?: boolean;
    ties?: TieViewModel[];
    accidentals?: AccidentalViewModel[];
    notes: NoteViewModel[];
    beamings?: BeamingViewModel[];
}
export interface StaffViewModel {
    timeSlots: TimeSlotViewModel[]
}

export interface ScoreViewModel {
    staves: StaffViewModel[];
}
