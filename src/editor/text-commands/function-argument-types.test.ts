import { Rational } from './../../model/rationals/rational';
import { expect } from 'chai';
import { FunctionArg } from './function-argument-types';

describe('Argument types', () => {
        
    describe('Function', () => {
        it('should parse a function token without extra arguments', () => {
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

        
        it('should parse a function token with one extra argument', () => {
            const res = FunctionArg('@Tuplet( 2/3 , $notes )');
            expect(res).to.deep.eq([
                {
                    args: [{
                        variable: 'notes'
                    }],
                    extraArgs: [{numerator: 2, denominator: 3} as Rational],
                    function: 'Tuplet'
                },
                ''
            ]);
        });
    });
});


