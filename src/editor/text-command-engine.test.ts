import { expect } from 'chai';
import { InsertionPoint } from './insertion-point';
import Sinon = require('sinon');
import { Clef, ClefType, JMusic, Key, MeterFactory, Time, isClefChange, isKeyChange, isMeterChange } from '../model';
import { TextCommandEngine } from './text-command-engine';
import { StateChange } from '~/model/states/state';




describe('Text commands', () => {
    describe('Execute command', () => {

        let model: Sinon.SinonStubbedInstance<JMusic>, ins: Sinon.SinonStubbedInstance<InsertionPoint>;

        beforeEach(() => {
            model = Sinon.stub(new JMusic());
            ins = Sinon.stub(new InsertionPoint(model));
        });

        afterEach(() => {
            Sinon.reset();
        });

        it('should fail when gibberish', () => {
            expect(() => TextCommandEngine.parse('njvkrfldsb')).to.throw(/Unknown command/);
        });

        it('should select a voice', () => {
            const cmd = TextCommandEngine.parse('voice 2');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToVoice, 0, 1);
        });

        it('should select a voice on another staff', () => {
            const cmd = TextCommandEngine.parse('voice 2:1');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToVoice, 1, 0);
        });
        it('should select a voice on another staff, alternative notation', () => {
            const cmd = TextCommandEngine.parse('voice 7.3');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToVoice, 6, 2);
        });


        it('should move insertion point to absolute time', () => {
            const cmd = TextCommandEngine.parse('goto 4/4');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToTime, Time.newAbsolute(4, 4));
        });


        it('should move insertion point to next event', () => {
            const cmd = TextCommandEngine.parse('goto next');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveRight);
        });

        it('should move insertion point to previous event', () => {
            const cmd = TextCommandEngine.parse('goto prev');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveLeft);
        });


        it('should move insertion point to start', () => {
            const cmd = TextCommandEngine.parse('goto start');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToTime, Time.newAbsolute(0, 1));
        });


        it('should add an empty staff', () => {
            const cmd = TextCommandEngine.parse('add staff');

            const jMusic = new JMusic('c4 c4 c4 c4');

            expect(jMusic.model.project.score.staves).to.have.length(1);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.model.project.score.staves).to.have.length(2);
        });
        

        it('should set a key change', () => {
            const cmd = TextCommandEngine.parse('set  key  5#');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(model.insertElementAtInsertionPoint, ins, StateChange.newKeyChange(new Key({ accidental: 1, count: 5 })), isKeyChange);
        });


        it('should set a meter change', () => {
            const cmd = TextCommandEngine.parse('set meter\t3/8');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(model.insertElementAtInsertionPoint, ins, StateChange.newMeterChange(MeterFactory.createRegularMeter({ value: 8, count: 3 })), isMeterChange);
        });


        it('should set a clef change', () => {
            const cmd = TextCommandEngine.parse('set clef \\clef alto');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(model.insertElementAtInsertionPoint, ins, StateChange.newClefChange(new Clef({ clefType: ClefType.C, line: 0 })), isClefChange);
        });





        it('should append music', () => {
            const cmd = TextCommandEngine.parse('append d4 e4 f2');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            //expect(jMusic.model.project.score.staves[0].voices[0].contentDef).to.have.length(1);
            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(7);
        });

        it('should append music with rest and spacer', () => {
            const cmd = TextCommandEngine.parse('append r4 s4 f2');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            //expect(jMusic.model.project.score.staves[0].voices[0].contentDef).to.have.length(1);
            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(7);
        });

        
        it('should append music with a key change', () => {
            const cmd = TextCommandEngine.parse('append 2b d4 e4 f2');
            //const cmd = TextCommandEngine.parse('append \\key f \\major d4 e4 f2');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(8);
            expect((jMusic.staves[0].voices[0].content.elements[4] as any).key.def).to.deep.eq({
                accidental: -1,
                count: 2
            });
        });


        it('should append music with a meter change', () => {
            const cmd = TextCommandEngine.parse('append 3/4 d4 e4 f4');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(8);
            expect((jMusic.staves[0].voices[0].content.elements[4] as any).meter.def).to.deep.eq({
                value: 4,
                count: 3
            });
        });

        
        it('should append music with a clef change', () => {
            const cmd = TextCommandEngine.parse('append \\clef bass d4 e4 f4');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(8);
            expect((jMusic.staves[0].voices[0].content.elements[4] as any).clef.def).to.deep.eq({
                clefType: ClefType.F,
                line: 2
            });
        });

    });
});