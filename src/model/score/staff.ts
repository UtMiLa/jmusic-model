import { KeyDef } from './../states/key';
import { SequenceDef } from './sequence';
import { ClefDef } from '../states/clef';
import { ClefViewModel } from '../../logical-view/view-model/convert-model';
export interface StaffDef {
    initialClef: ClefDef;
    initialKey: KeyDef;
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