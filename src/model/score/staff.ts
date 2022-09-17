import { NoteType, NoteDirection } from '../notes/note';
import { Sequence, SequenceDef } from './sequence';
import { Clef, ClefDef, ClefType } from '../states/clef';
import { ClefViewModel } from '../../logical-view/view-model/convert-model';
export interface StaffDef {
    initialClef: ClefDef;
    seq: SequenceDef;
}



export function isClefVM(element: any): ClefViewModel | undefined {
    if (typeof element.clefType === 'number') {
        return element as unknown as ClefViewModel;
    }
    return undefined;
}


export class Staff {
    
}