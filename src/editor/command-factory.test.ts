import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';

describe('Command factory', () => {
    describe('Command input', () => {
        it('should create a command based on a string', () => {
            const fac = new BaseCommandFactory();
            const ins = new InsertionPoint({staves: []});

            const obj = fac.createCommand('DeleteNote', ins);

            expect(obj).to.deep.eq({ name: 'del note' });
            
            const obj1 = fac.createCommand('DeletePitch', ins, [1]);

            expect(obj1).to.deep.eq({ name: 'del pitch' });
        });
    });
});