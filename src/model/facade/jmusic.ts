import { RegularMeterDef } from './../states/meter';
import { Key, KeyDef } from './../states/key';
import { Clef, ClefDef } from './../states/clef';
import { RepeatDef } from '../score/repeats';
import { parseLilyClef, parseLilyKey, parseLilyMeter, SimpleSequence } from '../score/sequence';
import { StaffDef } from '../score/staff';
import { ScoreDef } from './../score/score';
import { Meter } from '../states/meter';

export interface JMusicSettings {
    content: string[][];
    clefs?: (Clef | string)[];
    meter?: Meter | string;
    key?: Key | string;
}

export class JMusic implements ScoreDef {

    constructor(voice?: string | JMusicSettings) {
        if (typeof(voice) === 'string') {
            this.staves.push({ 
                initialClef: Clef.clefTreble.def,
                initialKey: { count: 0, accidental: 0 },
                voices: [{ content: new SimpleSequence(voice) }]
            });
        } else if (typeof(voice) === 'object') {
            const settings = voice as JMusicSettings;
            settings.content.forEach((stf, idx) => {
                
                let clef: ClefDef;
                if (settings.clefs) {
                    clef = JMusic.makeClef(settings.clefs[idx]);
                } else if (idx > 0 && idx === settings.content.length - 1) {
                    clef = Clef.clefBass.def;
                } else {
                    clef = Clef.clefTreble.def;
                }                

                const key = settings.key ? JMusic.makeKey('\\key ' + settings.key) : { count: 0, accidental: 0 } as KeyDef;

                const meter = settings.meter ? JMusic.makeMeter('\\meter ' + settings.meter) : undefined;

                this.staves.push({ 
                    initialClef: clef,
                    initialKey: key,
                    initialMeter: meter,
                    voices: stf.map(cnt => ({ content: new SimpleSequence(cnt) }))
                });
            });
        }
    }

    staves: StaffDef[] = [];
    repeats?: RepeatDef[] | undefined;

    static makeClef(input: string | Clef | ClefDef): ClefDef {
        if (typeof (input) === 'string') {
            return parseLilyClef(input).def;
        }
        const cd = input as ClefDef;
        if (cd.clefType !== undefined && cd.line !== undefined ) {
            return cd;
        }
        return (input as Clef).def;
    }

    static makeKey(input: string | Key | KeyDef): KeyDef {
        if (typeof (input) === 'string') {
            return parseLilyKey(input).def;
        }
        const cd = input as KeyDef;
        if (cd.accidental !== undefined && cd.count !== undefined ) {
            return cd;
        }
        return (input as Key).def;
    }

    static makeMeter(input: string | Meter | RegularMeterDef): RegularMeterDef {

        if (typeof (input) === 'string') {
            return parseLilyMeter(input).def as RegularMeterDef;
        }
        const cd = input as RegularMeterDef;
        if (cd.value !== undefined && cd.count !== undefined ) {
            return cd;
        }
        return (input as Meter).def as RegularMeterDef;
    }

}