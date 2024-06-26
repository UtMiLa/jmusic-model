import { MeterFactory } from './../states/meter';
import { Clef, Key, Meter, MeterDef, RegularMeterDef, StaffDef } from './../';
import { Voice, voiceDefToVoice, voiceSequenceToDef } from './voice';
import { KeyDef } from './../';
import { ISequence } from './sequence';
import { ClefDef } from '../';
import { VariableRepository, createRepo } from './variables';
import R = require('ramda');

/*export interface StaffDef {
    initialClef: ClefDef;
    initialKey: KeyDef;
    initialMeter?: RegularMeterDef;
    voices: VoiceDef[];
}*/


export interface Staff {
    initialClef: Clef;
    initialKey: Key;
    initialMeter?: Meter;
    voices: Voice[];}



export function setStaffSequence(staffDef: StaffDef, seq: ISequence): void {
    staffDef.voices = [{ contentDef: voiceSequenceToDef(seq) }];
}



export function staffDefToStaff(def: StaffDef, repo?: VariableRepository): Staff {
    if (!repo) repo = createRepo({});
    return {
        initialClef: Clef.create(def.initialClef),
        initialKey: Key.create(def.initialKey),
        initialMeter: def.initialMeter ? Meter.create(def.initialMeter) : undefined,
        voices: R.chain(v => voiceDefToVoice(v, repo), def.voices)
    };
}
