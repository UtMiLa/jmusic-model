import { expect } from 'chai';
import { BaseCommandFactory } from './command-factory';
import { InsertionPoint } from './insertion-point';
import { DeletePitchCommand } from './commands';
import Sinon = require('sinon');
import { JMusic } from '~/model';

describe('Commands', () => {
    describe('Delete pitch command', () => {
        it('should delete a pitch', () => {
            
            const model = Sinon.stub(new JMusic());
            const ins = new InsertionPoint(model);
            const cmd = new DeletePitchCommand([ins]);
            
            cmd.execute(model);

            Sinon.assert.calledOnceWithExactly(model.removePitch, ins);

        });
    });
});