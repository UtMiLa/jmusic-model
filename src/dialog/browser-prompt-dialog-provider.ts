import { Alteration } from './../model/pitches/pitch';
import { StaffDef } from './../model/score/staff';
import { ScoreDef } from './../model/score/score';
import { RegularMeterDef } from './../model/states/meter';
import { Clef, ClefDef } from './../model/states/clef';
import { Key, KeyDef } from './../model/states/key';
import { JMusic } from './../model/facade/jmusic';
import { DialogProvider } from './dialog-provider';
import R = require('ramda');
import { FlexibleSequence } from '../model';

export class BrowserPromptDialogProvider implements DialogProvider {
    getKey(): Promise<KeyDef> {
        const keyStr = prompt('Input key string (e.g. bes major)');
        if (!keyStr) return Promise.reject();
        return Promise.resolve(JMusic.makeKey(keyStr));
    }
    getClef(): Promise<ClefDef> {
        const clefStr = prompt('Input clef string (e.g. treble or bass)');
        if (!clefStr) return Promise.reject();
        return Promise.resolve(JMusic.makeClef(clefStr));
    }
    getMeter(): Promise<RegularMeterDef> {
        const meterStr = prompt('Input meter string (e.g. 3/4)');
        if (!meterStr) return Promise.reject();
        return Promise.resolve(JMusic.makeMeter(meterStr));
    }
    getNewScore(): Promise<ScoreDef> {
        const scoreStr = prompt('Input score def in format Meter Key, clef1 noVoices1, clef2 noVoices2,...()');
        if (!scoreStr) return Promise.reject();
        const [meterKeyDef, ...stavesDef] = scoreStr.split(',');
        const [meterDef, ...keyDef] = meterKeyDef.split(' ');
        const meter = JMusic.makeMeter(meterDef.trim());
        const key = JMusic.makeKey(keyDef.join(' ').trim());

        return Promise.resolve({ 
            staves: stavesDef.map(sd => {
                const [clefStr, voiceNo] = sd.split(' ');
                
                return { 
                    voices: R.range(1, +voiceNo).map(() => ({ content: new FlexibleSequence('') })), 
                    initialClef: JMusic.makeClef(clefStr), 
                    initialKey: key,
                    initialMeter: meter
                } as StaffDef;
            })
        });

    }
}