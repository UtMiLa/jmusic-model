import { VoiceDef, voiceDefToVoice } from './voice';
import { expect } from 'chai';
import { MultiSequence } from './types';
import { ClefType, JMusic, ScoreDef } from '..';

describe('Voices', () => {
    
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';


    xit('should support multiple simultaneous sequences', () => {

        const multiSeq: MultiSequence = {
            type: 'multi',
            sequences: [seq1Text, seq2Text]
        };

        const voiceDef: VoiceDef = {
            contentDef: multiSeq
        };

        const score: ScoreDef = {
            staves: [
                { 
                    voices: [voiceDef],
                    initialClef: { clefType: ClefType.G, line: 2 },
                    initialKey: { accidental: 0, count: 0 },
                    initialMeter: undefined
                }
            ]
        };

        const model = new JMusic(score);

        expect(model.staves[0].voices.length).to.eq(2);
    });


    it('should convert multiple simultaneous sequences to several voices', () => {

        const multiSeq: MultiSequence = {
            type: 'multi',
            sequences: [seq1Text, seq2Text]
        };
        
        const voiceDef: VoiceDef = {
            contentDef: multiSeq
        };

        const multi = voiceDefToVoice(voiceDef) as any;

        console.log('Multi', multi[0].content._def[0].sequences);
 
        expect(multi.length).to.eq(2);
    });
});