import { NoteViewModel } from './note-view-model';
import { ClefType } from '../../model/states/clef';
import { NoteDirection, NoteType } from '../../model/notes/note';
import { Clef } from '../../model/states/clef';
import { Sequence } from '../../model/score/sequence';
import { StaffDef } from '../../model/score/staff';

export interface ClefViewModel {
    position: number;
    clefType: ClefType;
    line: number;
}

export interface StaffViewModel {
    objects: (NoteViewModel | ClefViewModel)[];
}

export interface ScoreViewModel {
    staves: StaffViewModel[];
}

export function modelToViewModel(def: StaffDef): StaffViewModel {
    const seq = new Sequence(def.seq);        
    const clef = new Clef(def.initialClef);
    return {
        objects: ([
            { 
                position: 1,
                clefType: def.initialClef.clefType,
                line: def.initialClef.line
            }
        ] as (NoteViewModel | ClefViewModel)[]).concat(
            seq.elements.map(elem => {
                return {
                    positions: elem.pitches.map(p => clef.map(p)),
                    noteType: elem.type,
                    direction: NoteDirection.Up
                };
            })
        )
    };
}