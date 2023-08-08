import { LongDecorationType } from './../decorations/decoration-type';
import { InsertionPoint } from './../../editor/insertion-point';
import { MeterFactory } from './../states/meter';
import { Time } from './../rationals/time';
import { Clef, ClefType } from './../states/clef';
import { expect } from 'chai';
import { JMusic, initStateInSequence } from './jmusic';
import { createNoteFromLilypond, Note, NoteDirection } from '../notes/note';
import { Pitch } from '../pitches/pitch';
import { Key } from '../states/key';
import { StaffDef } from '../score/staff';
import { FlexibleSequence } from '../score/flexible-sequence';
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
                var1: 'f8 g8 a8 b8'
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
            const v = score.getView('var1');
            const ins = { 
                time: Time.newAbsolute(1, 8),
                voiceNo: 0,
                staffNo: 0,
                position: 0
            } as InsertionPoint;

            expect(valueOf(score.vars, 'var1').elements[1]).to.deep.eq(createNoteFromLilypond('g8'));

            v.removePitch(ins, Pitch.parseLilypond('g'));
            expect(R.dissoc('uniq', v.staves[0].voices[0].content.elements[1] as Note))
                .to.deep.eq(createNoteFromLilypond('r8'));
            expect(valueOf(score.vars, 'var1').elements[1]).to.deep.eq(createNoteFromLilypond('r8'));
        });

        

    });
});