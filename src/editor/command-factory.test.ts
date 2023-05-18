import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';
import { AddNoteCommand, DeleteNoteCommand, DeletePitchCommand } from './commands';
import Sinon = require('sinon');
import { createNoteFromLilypond } from '~/model';

describe('Command factory', () => {
    describe('Command input', () => {
        it('should fail on an unknown command', () => {
            const fac = new BaseCommandFactory();
            const ins = Sinon.stub<InsertionPoint>(new InsertionPoint({staves: []}));
            ins.isAtEnd.returns(false);

            expect(() => fac.createCommand('NeverCreteACommandWithThisName', ins)).to.throw();
        });

        it('should create a command based on a string', () => {
            const fac = new BaseCommandFactory();
            const ins = Sinon.stub<InsertionPoint>(new InsertionPoint({staves: []}));
            ins.isAtEnd.returns(false);

            const obj = fac.createCommand('DeleteNote', ins);

            expect(obj).to.deep.eq(new DeleteNoteCommand([ins]));
            
            const obj1 = fac.createCommand('DeletePitch', ins);

            expect(obj1).to.deep.eq(new DeletePitchCommand([ins]));
        });


        it('should only create a command matching insertionPoint.isAtEnd', () => {
            const fac = new BaseCommandFactory();
            const ins = Sinon.stub<InsertionPoint>(new InsertionPoint({staves: []}));
            ins.isAtEnd.returns(true);

            expect(() => fac.createCommand('DeleteNote', ins)).to.throw();

            expect(() => fac.createCommand('DeleteNote', ins)).to.throw();

            const note = createNoteFromLilypond('e\'8');
            const obj2 = fac.createCommand('AddNote', ins, [note]);

            expect(obj2).to.deep.eq(new AddNoteCommand([ins, note]));
        });        
    });
});