import { InsertionPoint } from './../../editor/insertion-point';
import { Time } from './../rationals/time';
import { expect } from 'chai';
import { JMusic } from './jmusic';
import { createNoteFromLilypond, Note } from '../notes/note';
import { Pitch } from '../pitches/pitch';
import R = require('ramda');
import { valueOf } from '../score/variables';

describe('Facade', () => {


    describe('Views', () => {
        let score: JMusic;
        let scoreChangeCalls: number;

        beforeEach(() => {
            score = new JMusic({ 
                content: [['g4 g4 g4 g4 \\key a \\major g4 g4 g4 g4', 'c4 c4 c4 c4 c4 c4 c4 c4'], [[{function: 'Transpose', args: [{ variable: 'var1' }], extraArgs: [{ interval: 3, alteration: 0 }]}]]],
                meter: '4/4',
                clefs: [ 'treble', 'bass' ],
                key: 'g \\minor'
            }, {
                var1: 'f8 g8 a8 b8',
                varExtra: 'c4 d4 e4 f4'
            });
            scoreChangeCalls = 0;
            score.onChanged(() => { scoreChangeCalls++; });
        });

        it('should provide a view to one variable', () => {
            const v = score.getView('var1');
            expect(v.staves).to.have.length(1);
            expect(v.staves[0].voices).to.have.length(1);
        });

        it('should be able to update a variable through the view', () => {
            const v = score.getView('var1');
            const ins = { 
                time: Time.StartTime,
                voiceNo: 0,
                staffNo: 0,
                position: 0
            } as InsertionPoint;

            expect(valueOf(score.vars, 'var1').elements[0]).to.deep.eq(createNoteFromLilypond('f8'));

            v.addPitch(ins, Pitch.parseLilypond('g'));
            expect(R.dissoc('uniq', v.staves[0].voices[0].content.elements[0] as Note))
                .to.deep.eq(createNoteFromLilypond('<f g>8'));
            expect(valueOf(score.vars, 'var1').elements[0]).to.deep.eq(createNoteFromLilypond('<f g>8'));
        });

        it('should be able to alter a pitch in a variable through the view', () => {
            const v = score.getView('var1');
            const ins = { 
                time: Time.newAbsolute(1, 8),
                voiceNo: 0,
                staffNo: 0,
                position: 0
            } as InsertionPoint;

            expect(valueOf(score.vars, 'var1').elements[1]).to.deep.eq(createNoteFromLilypond('g8'));

            v.alterPitch(ins, -1);
            expect(R.dissoc('uniq', v.staves[0].voices[0].content.elements[1] as Note))
                .to.deep.eq(createNoteFromLilypond('ges8'));
            expect(valueOf(score.vars, 'var1').elements[1]).to.deep.eq(createNoteFromLilypond('ges8'));
        });

        
        it('should be able to remove a pitch in a variable through the view', () => {
            const v = score.getView('varExtra');
            const ins = { 
                time: Time.newAbsolute(1, 4),
                voiceNo: 0,
                staffNo: 0,
                position: 0
            } as InsertionPoint;

            expect(valueOf(score.vars, 'varExtra').elements[1]).to.deep.eq(createNoteFromLilypond('d4'));

            v.removePitch(ins, Pitch.parseLilypond('d'));
            expect(R.dissoc('uniq', v.staves[0].voices[0].content.elements[1] as Note))
                .to.deep.eq(createNoteFromLilypond('r4'));
            expect(valueOf(score.vars, 'varExtra').elements[1]).to.deep.eq(createNoteFromLilypond('r4'));
        });

        

    });
});