import { RegularMeterDef } from './../model/states/meter';
import { ClefDef } from './../model/states/clef';
import { KeyDef } from './../model/states/key';
import { JMusic } from './../model/facade/jmusic';
import { DialogProvider } from './dialog-provider';

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
        const MeterStr = prompt('Input meter string (e.g. 3/4)');
        if (!MeterStr) return Promise.reject();
        return Promise.resolve(JMusic.makeMeter(MeterStr));
    }

}