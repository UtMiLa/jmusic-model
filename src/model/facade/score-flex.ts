import { JMusicSettings, initStateInSequence } from '..';
import { NoteDirection } from '../notes/note';
import { FlexibleSequence } from '../score/flexible-sequence';
import { ScoreDef, isScoreDef } from '../score/score';
import { ProjectDef, isProjectDef } from '../score/types';
import { VariableRepository } from '../score/variables';
import { voiceSequenceToDef } from '../score/voice';
import { Clef, ClefDef } from '../states/clef';
import { KeyDef } from '../states/key';
import { makeClef } from './clef-flex';
import { makeKey } from './key-flex';
import { makeMeter } from './meter-flex';

export type ScoreFlex = string | JMusicSettings | ScoreDef | ProjectDef;

export function makeScore(voice: string | JMusicSettings | ScoreDef | ProjectDef | undefined, vars: VariableRepository): ScoreDef {
    const score: ScoreDef = {
        staves: []
    };
    if (typeof (voice) === 'string') {
        score.staves = [{
            initialClef: Clef.clefTreble.def,
            initialKey: { count: 0, accidental: 0 },
            initialMeter: { count: 4, value: 4 },
            voices: [{ content: voiceSequenceToDef(new FlexibleSequence(voice, vars)) }]
        }];
    } else if (isProjectDef(voice)) {
        score.staves = [...voice.score.staves];
        score.repeats = voice.score.repeats ?? [];
    } else if (isScoreDef(voice)) {
        score.staves = [...voice.staves];
        score.repeats = voice.repeats ?? [];
    } else if (typeof (voice) === 'object') {
        const settings = voice as JMusicSettings;
        score.staves = [];
        settings.content.forEach((stf, idx) => {

            let clef: ClefDef;
            if (settings.clefs) {
                clef = makeClef(settings.clefs[idx]);
            } else if (idx > 0 && idx === settings.content.length - 1) {
                clef = Clef.clefBass.def;
            } else {
                clef = Clef.clefTreble.def;
            }

            const key = settings.key ? makeKey(settings.key) : { count: 0, accidental: 0 } as KeyDef;

            const meter = settings.meter ? makeMeter(settings.meter) : undefined;

            score.staves.push({
                initialClef: clef,
                initialKey: key,
                initialMeter: meter,
                voices: stf.map((cnt, idx) => ({
                    content: voiceSequenceToDef(new FlexibleSequence(cnt, vars)),
                    noteDirection: stf.length === 1 ? NoteDirection.Undefined : idx % 2 === 0 ? NoteDirection.Up : NoteDirection.Down
                }))
            });
        });
    }



    score.staves.forEach(staff => {
        staff.voices.forEach(voice => {
            const states = initStateInSequence(new FlexibleSequence(voice.content, vars));
            if (states.clef) {
                //console.log('changing clef', staff.initialClef, states.clef);
                staff.initialClef = states.clef.def;
            }
            if (states.meter) {
                //console.log('changing meter', staff.initialMeter, states.meter);
                score.staves.forEach(staff1 => (staff1.initialMeter = states.meter.def));
            }
            if (states.key) {
                //console.log('changing key', staff.initialKey, states.key);
                score.staves.forEach(staff1 => (staff1.initialKey = states.key.def));
            }
        });
    });

    return score;
}

