import { RegularMeterDef } from './../states/meter';
import { Voice, VoiceDef, voiceDefToVoice, voiceSequenceToDef } from './voice';
import { KeyDef } from './../states/key';
import { ISequence } from './sequence';
import { ClefDef } from '../states/clef';
import { VariableRepository, createRepo } from './variables';

export interface StaffDef {
    initialClef: ClefDef;
    initialKey: KeyDef;
    initialMeter?: RegularMeterDef;
    voices: VoiceDef[];
}


export interface Staff {
    initialClef: ClefDef;
    initialKey: KeyDef;
    initialMeter?: RegularMeterDef;
    voices: Voice[];}



export function setStaffSequence(staffDef: StaffDef, seq: ISequence): void {
    staffDef.voices = [{ content: voiceSequenceToDef(seq) }];
}



export function staffDefToStaff(def: StaffDef, repo?: VariableRepository): Staff {
    if (!repo) repo = createRepo({});
    return {
        initialClef: def.initialClef,
        initialKey: def.initialKey,
        initialMeter: def.initialMeter,
        voices: def.voices.map(v => voiceDefToVoice(v, repo))
    };
}
