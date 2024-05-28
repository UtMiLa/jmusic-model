import { expect } from 'chai';
import { createNoteFromLilypond } from '../notes/note';
import { FlexibleSequence } from './flexible-sequence';
import { VariableRepository, createRepo, setVar } from './variables';
import { VariableDef, FlexibleItem } from '../';

describe('Variables', () => {
    it('should insert variable in sequence', () => {
        const var1: VariableDef = { id: 'var1', value:['c4', 'd4'] };
        const vars = createRepo({ var1:['c4', 'd4'] });
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
        const var1: VariableDef = { id: 'var1', value: ['c4', 'd4'] };
        const vars = createRepo({ var1: ['c4', 'd4'] });
        const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];

        const seq1 = new FlexibleSequence(seq1Text, vars);

        expect(seq1.indexToPath(0)).to.deep.eq([0]);
        expect(seq1.indexToPath(1)).to.deep.eq([1, { variable: 'var1'}, 0]);
        expect(seq1.indexToPath(2)).to.deep.eq([1, { variable: 'var1'}, 1]);
        expect(seq1.indexToPath(3)).to.deep.eq([2]);
        expect(() => seq1.indexToPath(4)).to.throw();
    });


    it('should update sequence when variable changes', () => {
        const var1: VariableDef = { id: 'var1', value: ['c4', 'd4'] };
        const vars = createRepo({ var1: ['c4', 'd4'] });
        const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];

        const seq1 = new FlexibleSequence(seq1Text, vars);

        const result0 = seq1.elements;

        expect(result0).to.have.length(4);

        setVar(vars, 'var1', 'e8');

        const result = seq1.elements;

        expect(result).to.have.length(3);
        expect(result[0]).to.deep.eq(createNoteFromLilypond('f8'));
        expect(result[1]).to.deep.eq(createNoteFromLilypond('e8'));
        expect(result[2]).to.deep.eq(createNoteFromLilypond('g8'));
    });
});