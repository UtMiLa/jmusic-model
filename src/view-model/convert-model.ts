import { ClefType } from '~/states/clef';
import { NoteDirection, NoteType } from './../notes/note';
import { Clef } from './../states/clef';
import { Sequence } from './../score/sequence';
import { StaffDef } from './../score/staff';
export interface NoteViewModel {
    positions: number[];
    noteType: NoteType;
    direction: NoteDirection;
}

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