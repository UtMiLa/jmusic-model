import { expect } from 'chai';
import { createNoteFromLilypond } from '../notes/note';
import { FlexibleItem, FlexibleSequence } from './flexible-sequence';
import { VariableDef, VariableRepository } from './variables';

describe('Variables', () => {
    it('should insert variable in sequence', () => {
        const var1: VariableDef = { id: 'var1', value: new FlexibleSequence(['c4', 'd4']) };
        const vars = new VariableRepository([var1]);
        const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];

        const seq1 = new FlexibleSequence(seq1Text, vars);

        const result = seq1.elements;

        expect(result).to.have.length(4);
        expect(result[0]).to.deep.eq(createNoteFromLilypond('f8'));
        expect(result[1]).to.deep.eq(createNoteFromLilypond('c4'));
        expect(result[2]).to.deep.eq(createNoteFromLilypond('d4'));
        expect(result[3]).to.deep.eq(createNoteFromLilypond('g8'));
    });

    

    it('should map an element index to a path even when variables are present', () => {
        const var1: VariableDef = { id: 'var1', value: new FlexibleSequence(['c4', 'd4']) };
        const vars = new VariableRepository([var1]);
        const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];

        const seq1 = new FlexibleSequence(seq1Text, vars);

        expect(seq1.indexToPath(0)).to.deep.eq([0, 0]);
        expect(seq1.indexToPath(1)).to.deep.eq([1, 0, 0]);
        expect(seq1.indexToPath(2)).to.deep.eq([1, 1, 0]);
        expect(seq1.indexToPath(3)).to.deep.eq([2, 0]);
        expect(() => seq1.indexToPath(4)).to.throw();
    });


    it('should update sequence when variable changes', () => {
        const var1: VariableDef = { id: 'var1', value: new FlexibleSequence(['c4', 'd4']) };
        const vars = new VariableRepository([var1]);
        const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];

        const seq1 = new FlexibleSequence(seq1Text, vars);

        const result0 = seq1.elements;

        expect(result0).to.have.length(4);

        vars.setVar('var1', new FlexibleSequence(['e8']));

        const result = seq1.elements;

        expect(result).to.have.length(3);
        expect(result[0]).to.deep.eq(createNoteFromLilypond('f8'));
        expect(result[1]).to.deep.eq(createNoteFromLilypond('e8'));
        expect(result[2]).to.deep.eq(createNoteFromLilypond('g8'));
    });
});