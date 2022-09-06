import { NoteType, NoteDirection } from './../notes/note';
import { Sequence, SequenceDef } from './sequence';
import { Clef, ClefDef, ClefType } from './../states/clef';
export interface StaffDef {
    initialClef: ClefDef;
    seq: SequenceDef;
}


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
export function isClefVM(element: any): ClefViewModel | undefined {
    if (typeof element.clefType === 'number') {
        return element as unknown as ClefViewModel;
    }
    return undefined;
}

export interface StaffViewModel {
    objects: (NoteViewModel | ClefViewModel)[];
}

export class Staff {
    static defToViewModel(def: StaffDef): StaffViewModel {
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
                        positions: [clef.map(elem.pitch)],
                        noteType: elem.type,
                        direction: NoteDirection.Up
                    };
                })
            )
        };
    }
}