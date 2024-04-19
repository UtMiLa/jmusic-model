import { expect } from 'chai';
import { FunctionArg } from './function-argument-types';

describe('Argument types', () => {
        
    describe('Function', () => {
        it('should parse a function token', () => {
            const res = FunctionArg('@Grace( $notes )');
            expect(res).to.deep.eq([
                {
                    args: [{
                        variable: 'notes'
                    }],
                    extraArgs: [],
                    function: 'Grace'
                },
                ''
            ]);
        });
    });
});


