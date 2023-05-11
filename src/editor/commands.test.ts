import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';
import { DeleteNoteCommand, DeletePitchCommand } from './commands';
import Sinon = require('sinon');
import { JMusic, Time } from '~/model';

describe('Commands', () => {
    describe('Delete pitch command', () => {

        let model: Sinon.SinonStubbedInstance<JMusic>, ins: InsertionPoint;

        beforeEach(() => {
            model = Sinon.stub(new JMusic());
            ins = new InsertionPoint(model);
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
            const cmd = new DeleteNoteCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.addPitch, ins);
        });
        
        it('should set a note duration', () => {
            const time = Time.newSpan(1, 16);
            const cmd = new DeleteNoteCommand([ins, time]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.setNoteValue, ins, time);
        });
        
        xit('should toggle a note\'s dots', () => {
            /*const cmd = new DeleteNoteCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.deleteNote, ins);*/
        });
        
        it('should change a pitch enharmonically', () => {
            const cmd = new DeleteNoteCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.changePitchEnharm, ins);
        });
        
        it('should alter a pitch', () => {
            const cmd = new DeleteNoteCommand([ins, -1]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.alterPitch, ins, -1);
        });
        
        it('should add a meter', () => {
            const cmd = new DeleteNoteCommand([ins, '5/8']);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.addMeterChg, ins, '5/8');
        });

        it('should add a clef');
        it('should add a key');
    });
});