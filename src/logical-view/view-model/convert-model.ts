import { keyToView, KeyViewModel } from './convert-key';
import { noteToView, NoteViewModel } from './note-view-model';
import { ClefType } from '../../model/states/clef';
import { NoteDirection, NoteType } from '../../model/notes/note';
import { Clef } from '../../model/states/clef';
import { Sequence } from '../../model/score/sequence';
import { StaffDef } from '../../model/score/staff';
import { convertKey } from '../../physical-view/physical/physical-key';
import { Key } from '../../model/states/key';

export interface ClefViewModel {
    position: number;
    clefType: ClefType;
    line: number;
}

export interface StaffViewModel {
    objects: (NoteViewModel | ClefViewModel | KeyViewModel)[];
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
            },
            keyToView(new Key(def.initialKey), new Clef(def.initialClef))
        ] as (NoteViewModel | ClefViewModel | KeyViewModel)[]).concat(
            seq.elements.map(elem =>noteToView(elem, clef)
                /* {
                return {
                    positions: elem.pitches.map(p => clef.map(p)).sort(),
                    noteType: elem.type,
                    direction: NoteDirection.Up
                };
            }*/)
        )
    };
}