import { JMusic } from './../model/facade/jmusic';
import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { BaseEventHandler } from './event-handler';
import { Command, DeleteNoteCommand } from './commands';
import Sinon = require('sinon');
import { InsertionPoint } from './insertion-point';

describe('Event handler', () => {
    describe('Command input', () => {
        it('should create a command based on a string', () => {
            const stub = Sinon.stub(new JMusic());
            const ins = new InsertionPoint(stub);

            const executer = {
                execute(command: Command) {
                    command.execute(stub);
                }
            };
            const hdl = new BaseEventHandler(new BaseCommandFactory(), executer, ins);

            hdl.actionSelected('DeleteNote');
            
            Sinon.assert.calledOnceWithExactly(stub.deleteNote, ins);

            hdl.actionSelected('DeletePitch');
            
            Sinon.assert.calledOnceWithExactly(stub.removePitch, ins);

            expect(() => hdl.actionSelected('NotExistingCommandId')).to.throw();

        });
    });
});