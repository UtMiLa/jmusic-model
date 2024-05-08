import { Time } from './../rationals/time';
import { RetrogradeSequence } from './../score/transformations';
import { expect } from 'chai';
import { createTestScore } from '../../tools/test-tools';
import { VoiceContentDef } from '../data-only/voices';
import { convertSequenceDataToConceptual } from './conversions';
import { createNoteFromLilypond } from '../notes/note';
import { ConceptualFunctionCall, ConceptualVarRef } from './types';
import { FuncDef, SeqFunction } from '../data-only/functions';

describe('Conversions', () => {

    it('should convert data-only sequence to object sequence', () => {
        const data: VoiceContentDef = ['c4 d4 e4 f4'];
        
        const conceptual = convertSequenceDataToConceptual(data, {});

        expect(conceptual.length).to.eq(4);
        expect(conceptual[2]).to.deep.eq(createNoteFromLilypond('e4'));
    });

    
    it('should convert data-only sequence with variable references to object sequence', () => {
        const data: VoiceContentDef = ['c4 d4 e4 f4', { variable: 'xx'}];

        const conceptual = convertSequenceDataToConceptual(data, { xx: ['g4 a4.']});

        expect(conceptual.length).to.eq(5);
        const varref = conceptual[4] as ConceptualVarRef;
        expect(varref.name).to.deep.eq('xx');
        expect(varref.items).to.have.length(2);
        expect(varref.items[0]).to.deep.eq(createNoteFromLilypond('g4'));
        expect(varref.duration).to.deep.eq(Time.newSpan(5, 8));
    });

    it('should convert data-only sequence with function calls to object sequence', () => {
        const data: VoiceContentDef = ['c4 d4 e4 f4', { function: 'Reverse', args: ['a4 g4.'] } as SeqFunction];

        const conceptual = convertSequenceDataToConceptual(data, {});

        expect(conceptual.length).to.eq(5);
        const funcref = conceptual[4] as ConceptualFunctionCall;
        expect(funcref.func).to.deep.eq('Reverse');
        expect(funcref.items).to.have.length(2);
        expect(funcref.items[0]).to.deep.eq(createNoteFromLilypond('a4'));
        expect(funcref.duration).to.deep.eq(Time.newSpan(5, 8));
    });
});
//const data = createTestScore([['c4 d4 e4 f4']], [4, 4], [3, -1]);