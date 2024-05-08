import { Time } from './../rationals/time';
import { RetrogradeSequence } from './../score/transformations';
import { expect } from 'chai';
import { createTestScore } from '../../tools/test-tools';
import { VoiceContentDef } from '../data-only/voices';
import { conceptualGetElements, convertConceptualSequenceToData, convertSequenceDataToConceptual } from './conversions';
import { createNoteFromLilypond } from '../notes/note';
import { ConceptualFunctionCall, ConceptualSequence, ConceptualVarRef } from './types';
import { FuncDef, SeqFunction } from '../data-only/functions';

describe('Conversions', () => {
    describe('Conversions from def to conceptual', () => {
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


    describe('Conversions from conceptual to def', () => {
        it('should convert object sequence to data-only sequence', () => {
            const conceptual: ConceptualSequence = [
                createNoteFromLilypond('c4'), 
                createNoteFromLilypond('d4'), 
                createNoteFromLilypond('e4'), 
                createNoteFromLilypond('f4')
            ];
            
            const data = convertConceptualSequenceToData(conceptual);

            expect(data).to.deep.eq(['c4', 'd4', 'e4', 'f4']);
        });

        
        it('should convert object sequence with variable reference to data-only sequence', () => {
            const conceptual: ConceptualSequence = [
                createNoteFromLilypond('c4'), 
                createNoteFromLilypond('d4'), 
                createNoteFromLilypond('e4'), 
                createNoteFromLilypond('f4'),
                {
                    type: 'VarRef',
                    name: 'xxx',
                    items: [],
                    duration: Time.newSpan(1, 2)
                } as ConceptualVarRef
            ];
            
            const data = convertConceptualSequenceToData(conceptual);

            expect(data).to.deep.eq(['c4', 'd4', 'e4', 'f4', { variable: 'xxx' }]);
        });
        it('should convert object sequence with function call to data-only sequence', () => {
            const conceptual: ConceptualSequence = [
                createNoteFromLilypond('c4'), 
                createNoteFromLilypond('d4'), 
                createNoteFromLilypond('e4'), 
                createNoteFromLilypond('f4'),
                {
                    type: 'Func',
                    name: 'Reverse',
                    func: 'Reverse',
                    items: [
                        createNoteFromLilypond('g4'), 
                        createNoteFromLilypond('a4.')
                    ],
                    duration: Time.newSpan(1, 2)
                } as ConceptualFunctionCall
            ];
            
            const data = convertConceptualSequenceToData(conceptual);

            expect(data).to.deep.eq(['c4', 'd4', 'e4', 'f4', { function: 'Reverse', args: ['g4', 'a4.'] }]);
        });
    });

    describe('Applying functions and variables', () => { 
        it('should apply content without variables and functions', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4'];
            const conceptual = convertSequenceDataToConceptual(data, {});

            const elements = conceptualGetElements(conceptual);

            expect(elements).to.have.length(4);
            expect(elements[2]).to.deep.eq(createNoteFromLilypond('e4'));
        });
        it('should apply variables\' content', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { variable: 'xx'}];
            const conceptual = convertSequenceDataToConceptual(data, { xx: ['g4 a4.']});

            const elements = conceptualGetElements(conceptual);

            expect(elements).to.have.length(6);
            expect(elements[5]).to.deep.eq(createNoteFromLilypond('a4.'));
        });
        it('should apply functions content', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { function: 'Reverse', args: ['a4 g4.'] } as SeqFunction];
            const conceptual = convertSequenceDataToConceptual(data, { xx: ['a4 g4.']});

            const elements = conceptualGetElements(conceptual);

            expect(elements).to.have.length(6);
            expect(elements[4]).to.deep.eq(createNoteFromLilypond('g4.'));
        });
    });
});