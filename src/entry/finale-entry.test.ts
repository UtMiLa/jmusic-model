import { createNoteFromLilypond } from '../model';
import { Pitch } from './../model/pitches/pitch';
import { JMusic } from './../model/facade/jmusic';
import { expect } from 'chai';
import { BaseCommandFactory } from '../editor//command-factory';
import { FinaleSmartEntry } from './finale-entry';
import { Command, DeleteNoteCommand } from '../editor/commands';
import Sinon = require('sinon');
import { InsertionPoint } from '../editor/insertion-point';

describe('Finale smart entry event handler', () => {
    describe('Command input', () => {
        it('should create a command based on a string', (done) => {
            const stub = Sinon.stub(new JMusic());
            const ins = Sinon.stub<InsertionPoint>(new InsertionPoint({staves: []}));
            ins.isAtEnd.returns(false);

            const executer = {
                execute(command: Command) {
                    command.execute(stub);
                }
            };
            const hdl = new FinaleSmartEntry(new BaseCommandFactory(), executer, ins);

            hdl.actionSelected('DeleteNote');
            
            Sinon.assert.calledOnceWithExactly(stub.deleteNote, ins);

            hdl.actionSelected('DeletePitch');
            
            Sinon.assert.calledOnceWithExactly(stub.removePitch, ins);

            hdl.actionSelected('NotExistingCommandId')            
                .then(() => { throw 'Should reject'; })
                .catch(() => { done(); });      

        });
    });


    describe('Midi in', () => {

        let stub: Sinon.SinonStubbedInstance<JMusic>, ins: Sinon.SinonStubbedInstance<InsertionPoint>, executer, hdl: FinaleSmartEntry, catcher: Sinon.SinonStub;

        beforeEach(() => {
            stub = Sinon.stub(new JMusic());
            ins = Sinon.stub(new InsertionPoint(stub));
            ins.isAtEnd.returns(false);

            executer = {
                execute(command: Command) {
                    command.execute(stub);
                }
            };

            catcher = Sinon.stub();

            hdl = new FinaleSmartEntry(new BaseCommandFactory(), executer, ins);

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

    describe('When insertionpoint is at end of voice', ()=> {
        let stub: Sinon.SinonStubbedInstance<JMusic>, ins: Sinon.SinonStubbedInstance<InsertionPoint>, executer, hdl: FinaleSmartEntry, catcher: Sinon.SinonStub;

        beforeEach(() => {
            stub = Sinon.stub(new JMusic());
            ins = Sinon.stub(new InsertionPoint(stub));
            ins.isAtEnd.returns(true);

            executer = {
                execute(command: Command) {
                    command.execute(stub);
                }
            };

            catcher = Sinon.stub();

            hdl = new FinaleSmartEntry(new BaseCommandFactory(), executer, ins);

        });


        it('should ignore commands needing a note', (done) => {
            hdl.actionSelected('DeletePitch')            
                .then(() => { throw 'Should reject'; })
                .catch(() => { done(); });      
        });

        it('should ignore keypresses needing a note', () => {
            expect(hdl.keyDown('Enter')).to.be.false;
        });

        it('should append a new note', () => {
            expect(hdl.keyDown('5')).to.be.true;

            Sinon.assert.calledOnceWithExactly(stub.appendNote, ins, createNoteFromLilypond('r4'));
        });

    });
});