import { Pitch } from './../model/pitches/pitch';
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


    describe('Midi in', () => {

        let stub: Sinon.SinonStubbedInstance<JMusic>, ins: InsertionPoint, executer, hdl: BaseEventHandler, catcher: Sinon.SinonStub;

        beforeEach(() => {
            stub = Sinon.stub(new JMusic());
            ins = new InsertionPoint(stub);

            executer = {
                execute(command: Command) {
                    command.execute(stub);
                }
            };

            catcher = Sinon.stub();

            hdl = new BaseEventHandler(new BaseCommandFactory(), executer, ins);

        });

        it('should broadcast MIDI input', () => {

            hdl.onNoteDown(catcher);

            hdl.noteDown(42);

            Sinon.assert.calledOnceWithExactly(catcher, 42);

        });

        it('should broadcast chord changes', () => {
            hdl.onChordChange(catcher);

            hdl.noteDown(42);
            hdl.noteDown(45);
            hdl.noteDown(49);

            hdl.noteUp(42);

            Sinon.assert.calledWithExactly(catcher, [42]);
            Sinon.assert.calledWithExactly(catcher, [42, 45]);
            Sinon.assert.calledWithExactly(catcher, [42, 45, 49]);
            Sinon.assert.calledWithExactly(catcher, [45, 49]);
            Sinon.assert.callCount(catcher, 4);

        });

        
        it('should change a note\'s pitches to midi chord', () => {
            hdl.onChordChange(catcher);

            hdl.noteDown(42);
            hdl.noteDown(45);
            hdl.noteDown(49);

            hdl.keyDown('Enter');

            Sinon.assert.calledOnceWithExactly(stub.setPitches, ins, [Pitch.fromMidi(42), Pitch.fromMidi(45), Pitch.fromMidi(49)]);

        });
    });
});