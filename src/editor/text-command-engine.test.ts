import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';
import { AddClefCommand, AddKeyCommand, AddMeterCommand, AddNoteCommand, AlterPitchCommand, ChangePitchEnharmCommand, DeleteNoteCommand, DeletePitchCommand, SetNoteDurationCommand, SetPitchCommand, SetPitchesCommand, ToggleNoteDotsCommand } from './commands';
import Sinon = require('sinon');
import { JMusic, Pitch, Time, createNoteFromLilypond } from '../model';
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
    });
});