import R = require('ramda');
import { JMusicSettings, initStateInMultiSequence } from '..';
import { NoteDirection } from '..';
import { MultiFlexibleSequence } from '../score/multi-flexible-sequence';
import { ScoreDef, isScoreDef } from '..';
import { FlexibleItem, ProjectDef, isProjectDef } from '..';
import { VariableRepository } from '../score/variables';
import { VoiceDef, voiceSequenceToDef } from '..';
import { Clef, ClefDef } from '..';
import { KeyDef } from '..';
import { makeClef } from './clef-flex';
import { makeKey } from './key-flex';
import { makeMeter } from './meter-flex';
import { ignoreIfUndefined } from '../../tools/ignore-if-undefined';

export type ScoreFlex = string | JMusicSettings | ScoreDef | ProjectDef;


function multiSeqVoicesToSingleSeqVoices(voices: VoiceDef[], vars: VariableRepository): VoiceDef[] {

    //console.log('multiSeqVoicesToSingleSeqVoices', voices);
    
    
    const f = (cnt: VoiceDef, idx: number) =>  {
        const multiSeq = new MultiFlexibleSequence(cnt.contentDef, vars);
        //console.log('multiSeq', multiSeq, multiSeq.seqs.length, idx);
        return multiSeq.seqs.map((seq, seqIndx) => ({
            contentDef: seq.asObject,
            ...ignoreIfUndefined('noteDirection', multiSeq.seqs.length === 1 ? cnt.noteDirection : seqIndx % 2 === 0 ? NoteDirection.Up : NoteDirection.Down)
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
        if (voice.score.repeats) score.repeats = voice.score.repeats;
    } else if (isScoreDef(voice)) {
        //console.log('makeScore scoreDef');
        score.staves = voice.staves.map(staff => ({...staff, voices: multiSeqVoicesToSingleSeqVoices(staff.voices, vars)}));
        if (voice.repeats) score.repeats = voice.repeats;
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
            });
        });
    }



    score.staves.forEach(staff => {
        staff.voices.forEach(voice => {
            const states = initStateInMultiSequence(new MultiFlexibleSequence(voice.contentDef, vars).seqs);
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

