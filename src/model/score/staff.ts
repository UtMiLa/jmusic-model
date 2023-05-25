import { RegularMeterDef } from './../states/meter';
import { VoiceDef } from './voice';
import { KeyDef } from './../states/key';
import { ISequence, SequenceDef } from './sequence';
import { ClefDef } from '../states/clef';

export interface StaffDef {
    initialClef: ClefDef;
    initialKey: KeyDef;
    initialMeter?: RegularMeterDef;
    voices: VoiceDef[];
}


export class Staff {
    static setSequence(staffDef: StaffDef, seq: ISequence): void {
        staffDef.voices = [{ content: seq }];
    }
}


