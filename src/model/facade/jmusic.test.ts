import { InsertionPoint } from './../../editor/insertion-point';
import { MeterFactory } from './../states/meter';
import { Time } from './../rationals/time';
import { Clef, ClefType } from './../states/clef';
import { expect } from 'chai';
import { JMusic } from './jmusic';
import { Note } from '../notes/note';
import { Pitch } from '../pitches/pitch';
import { Key } from '../states/key';

describe('Facade', () => {


    describe('Flex methods', () => {
        it('should read a meter in different types', () => {
            expect(JMusic.makeMeter('5/8')).to.deep.eq({ count: 5, value: 8 });
            expect(JMusic.makeMeter({ count: 5, value: 8 })).to.deep.eq({ count: 5, value: 8 });
            expect(JMusic.makeMeter(MeterFactory.createRegularMeter({ count: 5, value: 8 }))).to.deep.eq({ count: 5, value: 8 });
        });

        it('should read a clef in different types', () => {
            expect(JMusic.makeClef('treble')).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(JMusic.makeClef({ clefType: ClefType.G, line: -2 })).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(JMusic.makeClef(new Clef({ clefType: ClefType.G, line: -2 }))).to.deep.eq({ clefType: ClefType.G, line: -2 });
        });

        it('should read a key in different types', () => {
            expect(JMusic.makeKey('a \\major')).to.deep.eq({ accidental: 1, count: 3 });
            expect(JMusic.makeKey({ accidental: 1, count: 3 })).to.deep.eq({ accidental: 1, count: 3 });
            expect(JMusic.makeKey(new Key({ accidental: 1, count: 3 }))).to.deep.eq({ accidental: 1, count: 3 });
        });

        it('should read a note in different types', () => {
            expect(JMusic.makeNote('a,4')).to.deep.eq(new Note([Pitch.fromScientific('a', 2)], Time.QuarterTime));
            expect(JMusic.makeNote(new Note([Pitch.fromScientific('a', 2)], Time.QuarterTime))).to.deep.eq(new Note([Pitch.fromScientific('a', 2)], Time.QuarterTime));
        });
    });


    describe('Construction', () => {
        it('should create an empty score', () => {
            const sc = new JMusic();

            expect(sc.staves).to.deep.eq([]);
            expect(sc.repeats).to.be.undefined;
        });

        it('should create a one-voice one-staff score using shortcut', () => {
            const sc = new JMusic('c4 c4 c4 c4');

            expect(sc.staves).to.have.length(1);
            expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(sc.staves[0].initialKey).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[0].initialMeter).to.deep.eq({ count: 4, value: 4 });
            expect(sc.staves[0].voices).to.have.length(1);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            expect(sc.repeats).to.be.undefined;
        });
    
        it('should create a one-voice one-staff score using settings', () => {
            const sc = new JMusic({ content: [['c4 c4 c4 c4']]});

            expect(sc.staves).to.have.length(1);
            expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(sc.staves[0].initialKey).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[0].initialMeter).to.be.undefined;
            expect(sc.staves[0].voices).to.have.length(1);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            expect(sc.repeats).to.be.undefined;
        });
    
    
        it('should create a three-voice two-staff score using settings', () => {
            const sc = new JMusic({ content: [['g4 g4 g4 g4', 'c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4']]});

            expect(sc.staves).to.have.length(2);
            expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.G, line: -2 });
            expect(sc.staves[0].initialKey).to.deep.eq({ count: 0, accidental: 0 });
            expect(sc.staves[0].initialMeter).to.be.undefined;
            expect(sc.staves[0].voices).to.have.length(2);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            
            expect(sc.staves[1].initialClef).to.deep.eq({ clefType: ClefType.F, line: 2 });
            expect(sc.staves[1].initialKey).to.deep.eq({ count: 0, accidental: 0 });
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
            expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.C, line: 0 });
            expect(sc.staves[0].initialKey).to.deep.eq({ count: 2, accidental: -1 });
            expect(sc.staves[0].initialMeter).to.deep.eq({ count: 6, value: 8 });
            expect(sc.staves[0].voices).to.have.length(2);
            expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
            
            expect(sc.staves[1].initialClef).to.deep.eq({ clefType: ClefType.C, line: 2 });
            expect(sc.staves[1].initialKey).to.deep.eq({ count: 2, accidental: -1 });
            expect(sc.staves[1].initialMeter).to.deep.eq({ count: 6, value: 8 });
            expect(sc.staves[1].voices).to.have.length(1);
            expect(sc.staves[1].voices[0].content.duration).to.deep.eq(Time.WholeTime);
            expect(sc.staves[1].voices[0].content.elements).to.have.length(4);
            expect(sc.repeats).to.be.undefined;
        });
    });
    describe('Operations', () => {
        let score: JMusic;

        beforeEach(() => {
            score = new JMusic({ 
                content: [['g4 g4 g4 g4 \\key a \\major g4 g4 g4 g4', 'c4 c4 c4 c4 c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4 \\clef tenor c,4 c,4 c,4 c,4']],
                meter: '4/4',
                clefs: [ 'treble', 'bass' ],
                key: 'g \\minor'
            });
        });

        it('should append a note to a voice', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            score.appendNote(ins, 'e4');
            const seq = score.staves[0].voices[1].content;
            expect(seq.duration).to.deep.eq(Time.newSpan(9, 4));
            expect(seq.elements[8]).to.deep.eq(Note.parseLily('e4'));
        });

        // todo: make these methods work with function sequences as well

        it('should add a pitch to a note', () => {
            const ins = new InsertionPoint(score);
            ins.staffNo = 0;
            ins.voiceNo = 1;
            ins.time = Time.newAbsolute(3, 4);
            score.addPitch(ins, Pitch.parseLilypond('e'));
            const seq = score.staves[0].voices[1].content;
            expect(seq.elements[3]).to.deep.eq(Note.parseLily('<c e>4'));
        });

        xit('should remove a pitch from a note', () => {});
        xit('should alter a pitch in a note', () => {});
        xit('should convert a note to a rest', () => {});
        xit('should convert a rest to a note', () => {});
        xit('should delete a note', () => {});
        xit('should insert a note', () => {});
        xit('should insert a meter change', () => {});
        xit('should change a key change', () => {});
        xit('should delete a clef change', () => {});
        xit('should add a variable', () => {});
        xit('should retrieve a variable', () => {});
        xit('should use a variable reference', () => {});
        xit('should update references when a variable is changed', () => {});
    });

});