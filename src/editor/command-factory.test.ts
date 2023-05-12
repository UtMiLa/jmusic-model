import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';
import { DeleteNoteCommand, DeletePitchCommand } from './commands';

describe('Command factory', () => {
    describe('Command input', () => {
        it('should create a command based on a string', () => {
            const fac = new BaseCommandFactory();
            const ins = new InsertionPoint({staves: []});

            const obj = fac.createCommand('DeleteNote', ins);

            expect(obj).to.deep.eq(new DeleteNoteCommand([ins]));
            
            const obj1 = fac.createCommand('DeletePitch', ins);

            expect(obj1).to.deep.eq(new DeletePitchCommand([ins]));
        });
    });
});