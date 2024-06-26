import { StaffDef, ScoreDef, RegularMeterDef, ClefDef, KeyDef } from './../model';
import { DialogProvider } from './dialog-provider';
import R = require('ramda');
import { makeClef } from '../model/facade/clef-flex';
import { makeKey } from '../model/facade/key-flex';
import { makeMeter } from '../model/facade/meter-flex';

export class BrowserPromptDialogProvider implements DialogProvider {
    getKey(): Promise<KeyDef> {
        const keyStr = prompt('Input key string (e.g. bes major)');
        if (!keyStr) return Promise.reject();
        return Promise.resolve(makeKey(keyStr));
    }
    getClef(): Promise<ClefDef> {
        const clefStr = prompt('Input clef string (e.g. treble or bass)');
        if (!clefStr) return Promise.reject();
        return Promise.resolve(makeClef(clefStr));
    }
    getMeter(): Promise<RegularMeterDef> {
        const meterStr = prompt('Input meter string (e.g. 3/4)');
        if (!meterStr) return Promise.reject();
        return Promise.resolve(makeMeter(meterStr));
    }
    getNewScore(): Promise<ScoreDef> {
        const scoreStr = prompt('Input score def in format Meter Key, clef1 noVoices1, clef2 noVoices2,...()');
        if (!scoreStr) return Promise.reject();
        const [meterKeyDef, ...stavesDef] = scoreStr.split(',');
        const [meterDef, ...keyDef] = meterKeyDef.split(' ');
        const meter = makeMeter(meterDef.trim());
        const key = makeKey(keyDef.join(' ').trim());

        return Promise.resolve({ 
            staves: stavesDef.map(sd => {
                const [clefStr, voiceNo] = sd.split(' ');
                
                return { 
                    voices: R.range(1, +voiceNo).map(() => ({ contentDef: '' })), 
                    initialClef: makeClef(clefStr), 
                    initialKey: key,
                    initialMeter: meter
                } as StaffDef;
            })
        });

    }
}