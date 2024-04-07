import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';
import { AddClefCommand, AddKeyCommand, AddMeterCommand, AddNoteCommand, AlterPitchCommand, ChangePitchEnharmCommand, DeleteNoteCommand, DeletePitchCommand, SetNoteDurationCommand, SetPitchCommand, SetPitchesCommand, ToggleNoteDotsCommand } from './commands';
import Sinon = require('sinon');
import { Clef, JMusic, Pitch, Time, createNoteFromLilypond } from '../model';
import { TextCommandEngine } from './text-command-engine';




describe('Text commands', () => {
    describe('Delete pitch command', () => {

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
    });
});