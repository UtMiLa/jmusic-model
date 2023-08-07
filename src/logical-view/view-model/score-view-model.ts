import { LongDecorationViewModel } from './convert-decoration';
import { BeamingViewModel, TupletViewModel } from './note-view-model';
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
    change?: boolean;
    line: number;
    transposition: number;
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

export enum BarType {
    None, Simple, Double, End, Dotted
}
export interface BarViewModel {
    repeatEnd?: boolean;
    repeatStart?: boolean;
    barType: BarType;
}
export interface TimeSlotViewModel {
    absTime: AbsoluteTime; 
    clef?: ClefViewModel;
    key?: KeyViewModel;
    meter?: MeterViewModel;
    bar?: BarViewModel;
    ties?: TieViewModel[];
    accidentals?: AccidentalViewModel[];
    notes: NoteViewModel[];
    beamings?: BeamingViewModel[];
    tuplets?: TupletViewModel[];
    decorations?: LongDecorationViewModel[];
}
export interface StaffViewModel {
    timeSlots: TimeSlotViewModel[]
}

export interface ScoreViewModel {
    staves: StaffViewModel[];
}
