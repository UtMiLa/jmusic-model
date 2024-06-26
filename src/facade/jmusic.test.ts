import { LongDecorationType } from '../model';
import { InsertionPoint } from '../editor/insertion-point';
import { MeterFactory } from '../model/states/meter';
import { Time } from '../model/rationals/time';
import { Clef, ClefType } from '../model';
import { expect } from 'chai';
import { JMusic, initStateInSequence } from './jmusic';
import { createNoteFromLilypond, Note, NoteDirection } from '../model';
import { Pitch } from '../model/pitches/pitch';
import { DiatonicKey, Key } from '../model/states/key';
import { StaffDef } from '../model';
import { FlexibleSequence } from '../model/score/flexible-sequence';
import R = require('ramda');
import { valueOf } from '../model/score/variables';

describe('Facade', () => {

    describe('Construction', () => {
        it('should create an empty score', () => {
            const sc = new JMusic();

            expect(sc.staves).to.deep.eq([]);
            expect(sc.repeats).to.be.undefined;
        });

        it('should create a one-voice one-staff score using shortcut', () => {
            const sc = new JMusic('c4 c4 c4 c4');

            expect(sc.staves).to.have.length(1);
            expect(sc.staves[0].initialClef.def).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(sc.staves[0].initialKey.def).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[0].initialMeter?.def).to.deep.eq({ count: 4, value: 4 });
            expect(sc.staves[0].voices).to.have.length(1);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            expect(sc.repeats).to.be.undefined;
        });
    
        it('should create a one-voice one-staff score using settings', () => {
            const sc = new JMusic({ content: [['c4 c4 c4 c4']]});

            expect(sc.staves).to.have.length(1);
            expect(sc.staves[0].initialClef.def).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(sc.staves[0].initialKey.def).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[0].initialMeter).to.be.undefined;
            expect(sc.staves[0].voices).to.have.length(1);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            expect(sc.repeats).to.be.undefined;
        });
    
    
        it('should create a three-voice two-staff score using settings', () => {
            const sc = new JMusic({ content: [['g4 g4 g4 g4', 'c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4']]});

            expect(sc.staves).to.have.length(2);
            expect(sc.staves[0].initialClef.def).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(sc.staves[0].initialKey.def).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[0].initialMeter).to.be.undefined;
            expect(sc.staves[0].voices).to.have.length(2);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            
            expect(sc.staves[1].initialClef.def).to.deep.eq({ clefType: ClefType.F, line: 2 });
            expect(sc.staves[1].initialKey.def).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[1].initialMeter).to.be.undefined;
            expect(sc.staves[1].voices).to.have.length(1);
            expect(sc.staves[1].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[1].voices[0].content.elements).to.have.length(4);
            expect(sc.repeats).to.be.undefined;
        });
    


    
        it('should create a score with meter, key, and clef settings', () => {
            const sc = new JMusic({ 
                content: [['g4 g4 g4 g4', 'c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4']],
                meter: '6/8',
                clefs: [ 'alto', 'tenor' ], //clefs: [ Clef.clefAlto, Clef. clefTenor ],
                key: 'g \\minor'
            });

            expect(sc.staves).to.have.length(2);
            expect(sc.staves[0].initialClef.def).to.deep.eq({ clefType: ClefType.C, line: 0 });
            expect(sc.staves[0].initialKey.def).to.deep.eq({ count: 2, accidental: -1 });
            expect(sc.staves[0].initialMeter?.def).to.deep.eq({ count: 6, value: 8 });
            expect(sc.staves[0].voices).to.have.length(2);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            expect(sc.staves[0].voices[0].noteDirection).to.eq(NoteDirection.Up);
            expect(sc.staves[0].voices[1].noteDirection).to.eq(NoteDirection.Down);
            
            expect(sc.staves[1].initialClef.def).to.deep.eq({ clefType: ClefType.C, line: 2 });
            expect(sc.staves[1].initialKey.def).to.deep.eq({ count: 2, accidental: -1 });
            expect(sc.staves[1].initialMeter?.def).to.deep.eq({ count: 6, value: 8 });
            expect(sc.staves[1].voices).to.have.length(1);
            expect(sc.staves[1].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[1].voices[0].content.elements).to.have.length(4);
            expect(sc.repeats).to.be.undefined;
        });

        it('should create a score from a ScoreDef object', () => {
            const meterModel = {
                staves: [{
                    initialClef: { clefType: ClefType.G, line: -2 },
                    initialMeter: { count: 4, value: 4 },
                    initialKey: { accidental: -1, count: 0 },
                    voices:[
                        {
                            noteDirection: NoteDirection.Up,
                            contentDef: 'c\'1'
                        },
                        {
                            noteDirection: NoteDirection.Down,
                            contentDef: 'c1'
                        }
                    ]
                } as StaffDef,
                {
                    initialClef: { clefType: ClefType.F, line: 2 },
                    initialMeter: { count: 4, value: 4 },
                    initialKey: { accidental: -1, count: 0 },
                    voices:[
                        {
                            noteDirection: NoteDirection.Up,
                            contentDef: 'c,1'
                        }
                    ]
                } as StaffDef
                ]
            };

            const jMusicObj = new JMusic(meterModel);

            expect(jMusicObj.staves).to.have.length(2);
            expect(jMusicObj.staves[0].voices[0].noteDirection).to.eq(NoteDirection.Up);
            expect(jMusicObj.staves[0].voices[1].noteDirection).to.eq(NoteDirection.Down);
        });

        it('should create a score from a ScoreDef including repeats', () => {
            const scoreDef = {
                repeats: [
                    {from: Time.StartTime, to: Time.newAbsolute(3,1) },
                    {from: Time.newAbsolute(4,1), to: Time.newAbsolute(6,1) },
                    {from: Time.newAbsolute(6,1), to: Time.newAbsolute(8,1) },
                    {from: Time.newAbsolute(21,2), to: Time.newAbsolute(23,2) }
                ],
                staves: [
                   {
                       initialClef: { clefType: ClefType.F, line: 2 },
                       initialMeter: { count: 4, value: 4 },
                       initialKey: { accidental: -1, count: 3 },
                       voices:[
                           {
                               noteDirection: NoteDirection.Down,
                               contentDef: 'c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1'}
                       ]
                   } as StaffDef
                ]
            };

            const jMusic = new JMusic(scoreDef);

            expect(jMusic.repeats).to.have.length(4);
            expect(jMusic.staves[0].voices[0].noteDirection).to.eq(NoteDirection.Down);
        });

            
        it('should create a one-voice one-staff score using variables', () => {
            const sc = new JMusic(
                { content: [[['c4', { variable: 'varTest' }]]]},
                { varTest: ['e4 d4'] }
            );

            expect(sc.staves).to.have.length(1);
            expect(sc.staves[0].initialClef.def).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(sc.staves[0].initialKey.def).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[0].initialMeter).to.be.undefined;
            expect(sc.staves[0].voices).to.have.length(1);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.newSpan(3, 4));
            expect(sc.staves[0].voices[0].content.elements).to.have.length(3);
            expect(sc.staves[0].voices[0].content.elements[2]).to.deep.eq(createNoteFromLilypond('d4'));
            expect(sc.repeats).to.be.undefined;
        });
    

        it('should create a score using functions', () => {
            const sc = new JMusic(
                { content: [[['c4', { function: 'Relative', args: ['e4 \\clef bass d4'], extraArgs: ['c,'] }]]]}                
            );

            expect(sc.staves).to.have.length(1);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.newSpan(3, 4));
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            expect(sc.staves[0].voices[0].content.elements[3]).to.deep.eq(createNoteFromLilypond('d,4'));
        });
    

        it('should create a score using functions in variables', () => {
            const sc = new JMusic(
                { content: [[['c4', { variable: 'varTest' }]]]},
                { varTest: [{ function: 'Relative', args: ['e4 \\clef bass d4'], extraArgs: ['c,'] }] }
            );

            expect(sc.staves).to.have.length(1);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.newSpan(3, 4));
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            expect(sc.staves[0].voices[0].content.elements[3]).to.deep.eq(createNoteFromLilypond('d,4'));
        });
    

    });
    describe('Operations', () => {
        let score: JMusic;
        let scoreChangeCalls: number;

        beforeEach(() => {
            score = new JMusic({ 
                content: [['g4 g4 g4 g4 \\key a \\major g4 gis4 a4 ais4', 'c4 c4 c4 c4 c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4 \\clef tenor c,4 c,4 c,4 c,4']],
                meter: '4/4',
                clefs: [ 'treble', 'bass' ],
                key: 'g \\minor'
            });
            scoreChangeCalls = 0;
            score.onChanged(() => { scoreChangeCalls++; });
        });

        it('should clear the score', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            
            score.setVar('teste', 'c4 e4');
            expect(valueOf(score.vars, 'teste')).to.not.be.undefined;
            //expect(scoreChangeCalls).to.eq(1);

            score.clearScore(ins, { content: [[[]], [[], []], [[]]]} );

            expect(score.staves.length).to.eq(3);
            expect(score.staves[0].voices.length).to.eq(1);
            expect(score.staves[1].voices.length).to.eq(2);
            expect(score.staves[0].voices[0].content.elements.length).to.eq(0);
            expect(() => valueOf(score.vars, 'teste')).to.be.throw(/Undefined variable/);
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should append a note to a voice', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            score.appendNote(ins, 'e4');
            const seq = score.staves[0].voices[1].content;
            expect(seq.duration).to.deep.eq(Time.newSpan(9, 4));
            expect(seq.elements[8]).to.deep.eq(createNoteFromLilypond('e4'));
            expect(scoreChangeCalls).to.eq(1);
        });

        // todo: make these methods work with function sequences as well

        it('should add a pitch to a note', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.time = Time.newAbsolute(3, 4);
            score.addPitch(ins, Pitch.parseLilypond('e'));
            const seq = score.staves[0].voices[1].content;
            expect(R.dissoc('uniq', seq.elements[3] as Note)).to.deep.eq(createNoteFromLilypond('<c e>4'));
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should calculate a pitch from the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 3;
            ins.time = Time.newAbsolute(3, 4);
            const pitch = score.pitchFromInsertionPoint(ins);
            expect(pitch).to.deep.eq(Pitch.parseLilypond('e\'\''));
            expect(scoreChangeCalls).to.eq(0);

            ins.position = 4;
            const pitch1 = score.pitchFromInsertionPoint(ins);
            expect(pitch1).to.deep.eq(Pitch.parseLilypond('f\'\''));
        });

        it('should add a pitch from the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 3;
            ins.time = Time.newAbsolute(3, 4);
            score.addPitch(ins);
            const seq = score.staves[0].voices[1].content;
            expect(R.dissoc('uniq', seq.elements[3] as Note)).to.deep.eq(createNoteFromLilypond('<c e\'\'>4'));
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should set the pitches of a note at the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 3;
            ins.time = Time.newAbsolute(3, 4);
            score.setPitches(ins, [Pitch.parseLilypond('e\'\''), Pitch.parseLilypond('aes\'\''), Pitch.parseLilypond('b\'\'')]);
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[3]).to.deep.include(createNoteFromLilypond('<e\'\' aes\'\' b\'\'>4'));
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should remove a pitch from the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 1 - 14;
            ins.time = Time.newAbsolute(3, 4);
            score.removePitch(ins);
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[3]).to.deep.include(createNoteFromLilypond('r4'));
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should delete a note from the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 0;
            ins.position = 1;
            ins.time = Time.newAbsolute(3, 2);
            score.deleteNote(ins);
            const seq = score.staves[0].voices[0].content;
            expect(seq.elements[7]).to.deep.include(createNoteFromLilypond('ais4'));
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should change the value of a note at the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 0;
            ins.position = 1;
            ins.time = Time.newAbsolute(3, 2);
            score.setNoteValue(ins, Time.HalfTime);
            const seq = score.staves[0].voices[0].content;
            expect(seq.elements[7]).to.deep.include(createNoteFromLilypond('a2'));
            expect(scoreChangeCalls).to.eq(1);
        });

        
        /*it('should change the number of dots of a note at the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 0;
            ins.position = 1;
            ins.time = Time.newAbsolute(3, 2);
            score.setNoteDots(ins, 2);
            const seq = score.staves[0].voices[0].content);
            expect(seq.elements[7]).to.deep.include(createNoteFromLilypond('a4..'));
            expect(scoreChangeCalls).to.eq(1);
        });*/

        it('should change a pitch enharmonically at the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 1;
            ins.time = Time.newAbsolute(3, 4);
            score.changePitchEnharm(ins);
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[3]).to.deep.include(createNoteFromLilypond('bis,4'));
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should alter a pitch up or down at the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 1;
            ins.time = Time.newAbsolute(3, 4);
            score.alterPitch(ins, 1);
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[3]).to.deep.include(createNoteFromLilypond('cis4'));
            expect(scoreChangeCalls).to.eq(1);

            score.alterPitch(ins, -1);
            const seq2 = score.staves[0].voices[1].content;
            expect(seq2.elements[3]).to.deep.include(createNoteFromLilypond('c4'));
            expect(scoreChangeCalls).to.eq(2);
        });

        it('should alter a pitch without getting alteration of 3 at the insertion point', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 1;
            ins.time = Time.newAbsolute(3, 4);
            score.alterPitch(ins, -2);
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[3]).to.deep.include(createNoteFromLilypond('ceses4'));
            expect(scoreChangeCalls).to.eq(1);

            score.alterPitch(ins, -1);
            const seq2 = score.staves[0].voices[1].content;
            expect(seq2.elements[3]).to.deep.include(createNoteFromLilypond('b,4'));
            expect(scoreChangeCalls).to.eq(2);

            
            score.alterPitch(ins, 2);
            score.alterPitch(ins, 1);
            const seq3 = score.staves[0].voices[1].content;
            expect(seq3.elements[3]).to.deep.include(createNoteFromLilypond('c4'));
            expect(scoreChangeCalls).to.eq(4);
        });

        /*
        xit('should insert a note', () => {});*/

        it('should insert a meter change', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 3;
            ins.time = Time.newAbsolute(1, 1);
            score.addMeterChg(ins, '3/4');
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[4]).to.deep.include({meter: MeterFactory.createRegularMeter({ count: 3, value: 4})});
            expect(scoreChangeCalls).to.eq(1);
        });

        it('should overwrite a meter change', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 3;
            ins.time = Time.newAbsolute(1, 1);
            score.addMeterChg(ins, '3/4');
            score.addMeterChg(ins, '5/8');
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[4]).to.deep.include({meter: MeterFactory.createRegularMeter({ count: 5, value: 8})});
            expect(seq.elements[5]).to.deep.include(createNoteFromLilypond('c4'));
            expect(scoreChangeCalls).to.eq(2);
        });

        it('should change a key change', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 3;
            ins.time = Time.newAbsolute(1, 1);
            score.addKeyChg(ins, 'f major');
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[4]).to.deep.include({key: new DiatonicKey({ accidental: -1, count: 1 })});
            expect(scoreChangeCalls).to.eq(1);
        });
        it('should delete a clef change', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.position = 3;
            ins.time = Time.newAbsolute(1, 1);
            score.addClefChg(ins, 'alto');
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[4]).to.deep.include({clef: Clef.create({ line: 0, clefType: ClefType.C })});
            expect(scoreChangeCalls).to.eq(1);

        });
        /*xit('should add a variable', () => {});
        xit('should retrieve a variable', () => {});
        xit('should use a variable reference', () => {});
        xit('should update references when a variable is changed', () => {});*/
    });

    describe('Decorations', () => {
        let score: JMusic;
        let scoreChangeCalls: number;

        beforeEach(() => {
            score = new JMusic({ 
                content: [['g4 g4 g4 g4 \\key a \\major g4 g4 g4 g4', 'c4 c4 c4 c4 c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4 \\clef tenor c,4 c,4 c,4 c,4']],
                meter: '4/4',
                clefs: [ 'treble', 'bass' ],
                key: 'g \\minor'
            });
            scoreChangeCalls = 0;
            score.onChanged(() => { scoreChangeCalls++; });
        });

        it('should add a crescendo to a voice', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.time = Time.newAbsolute(3, 4);

            score.addLongDecoration(LongDecorationType.Crescendo, ins, Time.WholeTime);

            let voice = score.staves[0].voices[1];
            expect(voice.content.elements[3]).to.deep.equal({ longDeco: LongDecorationType.Crescendo, length: Time.WholeTime });
            expect(scoreChangeCalls).to.eq(1);

            ins.time = Time.newAbsolute(5, 4);
            score.addLongDecoration(LongDecorationType.Decrescendo, ins, Time.HalfTime);

            voice = score.staves[0].voices[1];
            expect(voice.content.elements[6]).to.deep.equal({ longDeco: LongDecorationType.Decrescendo, length: Time.HalfTime });
            expect(scoreChangeCalls).to.eq(2);

        });
    });

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

        it('should provide a view to the score', () => {
            const v = score.getView();
            expect(v.staves).to.have.length(2);
            expect(v.staves[0].voices).to.have.length(2);
        });
        
        it('should provide a helper function to find key/clef/meter at beat 0', () => {
            const seq1 = new FlexibleSequence('\\key a \\major g4 g4 g4 g4');
            const seq2 = new FlexibleSequence(['\\clef alto c4 c4 c4 c4']);
            const seq3 = new FlexibleSequence(['\\meter 3/8 c4 c4 c4 c4']);
            
            const foundStates1 = initStateInSequence(seq1);
            expect(foundStates1).to.deep.eq({key: new DiatonicKey({ accidental: 1, count: 3 })});
            
            const foundStates2 = initStateInSequence(seq2);
            expect(foundStates2).to.deep.eq({clef: Clef.create({ clefType: ClefType.C, line: 0 })});

            const foundStates3 = initStateInSequence(seq3);
            expect(foundStates3).to.deep.eq({ meter: MeterFactory.createRegularMeter({ count: 3, value: 8 })});
            
        });


        it('should override init key/clef/meter by state changes at beat 0', () => {
            const init = new JMusic({ 
                content: [
                    ['\\key a \\major g4 g4 g4 g4', '\\clef alto c4 c4 c4 c4'],
                    ['\\meter 3/8 c4 c4 c4 c4']
                ],
                meter: '4/4',
                clefs: [ 'treble', 'bass' ],
                key: 'g \\minor'
            }, {
                var1: 'f8 g8 a8 b8'
            });
            
            const staves = init.getView().staves;
           
            expect(staves[0].initialKey).to.deep.eq(new DiatonicKey({ accidental: 1, count: 3 }));
            expect(staves[1].initialKey).to.deep.eq(new DiatonicKey({ accidental: 1, count: 3 }));
            expect(staves[0].initialClef).to.deep.eq(Clef.create({ clefType: ClefType.C, line: 0 }));
            expect(staves[1].initialClef).to.deep.eq(Clef.create({ clefType: ClefType.F, line: 2 }));
            expect(staves[0].initialMeter).to.deep.eq(MeterFactory.createRegularMeter({ count: 3, value: 8 }));
            expect(staves[1].initialMeter).to.deep.eq(MeterFactory.createRegularMeter({ count: 3, value: 8 }));

        });

        /*xit('should be able to update a through bijective function through the view', () => {
            const v = score.getView();
            const ins = { 
                time: Time.StartTime,
                voiceNo: 0,
                staffNo: 1,
                position: 0
            } as InsertionPoint;

            expect(score.vars.valueOf('var1').elements[0]).to.deep.eq(createNoteFromLilypond('f8'));
            expect(v.staves[1].voices[0].content.elements[0]).to.deep.eq(createNoteFromLilypond('bes8'));

            v.addPitch(ins, Pitch.parseLilypond('g'));
            expect(v.staves[1].voices[0].content.elements[0]).to.deep.eq(createNoteFromLilypond('<bes g>8'));
            expect(score.vars.valueOf('var1').elements[0]).to.deep.eq(createNoteFromLilypond('<f d>8'));
        });*/

    });
});