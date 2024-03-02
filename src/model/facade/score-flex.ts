import R = require('ramda');
import { JMusicSettings, initStateInSequence } from '..';
import { NoteDirection } from '../notes/note';
import { FlexibleSequence } from '../score/flexible-sequence';
import { MultiFlexibleSequence } from '../score/multi-flexible-sequence';
import { ScoreDef, isScoreDef } from '../score/score';
import { FlexibleItem, ProjectDef, isProjectDef } from '../score/types';
import { VariableRepository } from '../score/variables';
import { VoiceContentDef, VoiceDef, voiceSequenceToDef } from '../score/voice';
import { Clef, ClefDef } from '../states/clef';
import { KeyDef } from '../states/key';
import { makeClef } from './clef-flex';
import { makeKey } from './key-flex';
import { makeMeter } from './meter-flex';

export type ScoreFlex = string | JMusicSettings | ScoreDef | ProjectDef;

function multiSeqVoicesToSingleSeqVoices(voices: VoiceDef[], vars: VariableRepository): VoiceDef[] {

    //console.log('multiSeqVoicesToSingleSeqVoices', voices);
    
    
    const f = (cnt: VoiceDef, idx: number) =>  {
        const multiSeq = new MultiFlexibleSequence(cnt.contentDef, vars);
        //console.log('multiSeq', multiSeq, multiSeq.seqs.length, idx);
        return multiSeq.seqs.map((seq, seqIndx) => ({
            contentDef: seq.asObject,
            noteDirection: multiSeq.seqs.length === 1 ? NoteDirection.Undefined : seqIndx % 2 === 0 ? NoteDirection.Up : NoteDirection.Down
        } as VoiceDef));
    };

    return R.addIndex<VoiceDef, VoiceDef[]>(R.chain)(f)(voices);
}

export function makeScore(voice: string | JMusicSettings | ScoreDef | ProjectDef | undefined, vars: VariableRepository): ScoreDef {

    //console.log('makeScore', voice);

    const score: ScoreDef = {
        staves: []
    };
    if (typeof (voice) === 'string') {
        score.staves = [{
            initialClef: Clef.clefTreble.def,
            initialKey: { count: 0, accidental: 0 },
            initialMeter: { count: 4, value: 4 },
            voices: new MultiFlexibleSequence(voice, vars).seqs.map(seq => ({ contentDef: voiceSequenceToDef(seq) }))
            //[{ contentDef: voiceSequenceToDef(new FlexibleSequence(voice, vars)) }]
        }];
    } else if (isProjectDef(voice)) {
        score.staves = [...voice.score.staves];
        score.repeats = voice.score.repeats ?? [];
    } else if (isScoreDef(voice)) {
        //console.log('makeScore scoreDef');
        score.staves = voice.staves.map(staff => ({...staff, voices: multiSeqVoicesToSingleSeqVoices(staff.voices, vars)}));
        score.repeats = voice.repeats ?? [];
    } else if (typeof (voice) === 'object') {
        //console.log('makeScore object');
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


            const f = (cnt: FlexibleItem, idx: number) => new MultiFlexibleSequence(cnt, vars).seqs.map(seq => ({
                contentDef: seq.asObject,
                noteDirection: stf.length === 1 ? NoteDirection.Undefined : idx % 2 === 0 ? NoteDirection.Up : NoteDirection.Down
            } as VoiceDef));

            //console.log('Testing multiflex', score);
            

            score.staves.push({
                initialClef: clef,
                initialKey: key,
                initialMeter: meter,
                voices: R.addIndex<FlexibleItem, VoiceDef[]>(R.chain)(f)(stf)

                /*voices: R.chain((cnt: FlexibleItem, idx: number) => 
                    new MultiFlexibleSequence(cnt, vars).seqs.map(seq => ({
                        contentDef: seq.asObject,
                        noteDirection: stf.length === 1 ? NoteDirection.Undefined : idx % 2 === 0 ? NoteDirection.Up : NoteDirection.Down
                    } as VoiceDef)))(stf)*/
            });
        });
    }



    score.staves.forEach(staff => {
        staff.voices.forEach(voice => {
            const states = initStateInSequence(new FlexibleSequence(voice.contentDef, vars));
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

