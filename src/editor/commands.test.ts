import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';
import { AddClefCommand, AddKeyCommand, AddMeterCommand, AlterPitchCommand, ChangePitchEnharmCommand, DeleteNoteCommand, DeletePitchCommand, SetNoteDurationCommand, SetPitchCommand, ToggleNoteDotsCommand } from './commands';
import Sinon = require('sinon');
import { JMusic, Time, createNoteFromLilypond } from '../model';

describe('Commands', () => {
    describe('Delete pitch command', () => {

        let model: Sinon.SinonStubbedInstance<JMusic>, ins: InsertionPoint;

        beforeEach(() => {
            model = Sinon.stub(new JMusic());
        });

        afterEach(() => {
            Sinon.reset();
        });

        it('should delete a pitch', () => {
            const cmd = new DeletePitchCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.removePitch, ins);
        });

        it('should delete a note', () => {
            const cmd = new DeleteNoteCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.deleteNote, ins);
        });
        
        it('should set a pitch', () => {
            const cmd = new SetPitchCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.addPitch, ins);
        });
        
        it('should set a note duration', () => {
            const time = Time.newSpan(1, 16);
            const cmd = new SetNoteDurationCommand([ins, time]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.setNoteValue, ins, time);
        });
        
        it('should toggle a note\'s dots', () => {
            model.noteFromInsertionPoint.returns(createNoteFromLilypond('c4'));

            const cmd = new ToggleNoteDotsCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.setNoteValue, ins, Time.newSpan(3, 8));
        });
        
        it('should change a pitch enharmonically', () => {
            const cmd = new ChangePitchEnharmCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.changePitchEnharm, ins);
        });
        
        it('should alter a pitch', () => {
            const cmd = new AlterPitchCommand([ins, -1]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.alterPitch, ins, -1);
        });
        
        it('should add a meter', () => {
            const cmd = new AddMeterCommand([ins, '5/8']);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.addMeterChg, ins, '5/8');
        });

        it('should add a clef', () => {
            const cmd = new AddClefCommand([ins, 'alto']);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.addClefChg, ins, 'alto');
        });
        it('should add a key', () => {
            const cmd = new AddKeyCommand([ins, 'f major']);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.addKeyChg, ins, 'f major');
        });
    });
});