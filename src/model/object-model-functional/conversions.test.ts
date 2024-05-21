import { Time } from './../rationals/time';
import { expect } from 'chai';
import { VoiceContentDef } from '../data-only/voices';
import { conceptualGetElements, convertConceptualSequenceToData, convertSequenceDataToConceptual, normalizeVars } from './conversions';
import { createNoteFromLilypond } from '../notes/note';
import { ConceptualFunctionCall, ConceptualSequence, ConceptualVarRef } from './types';
import { SeqFunction } from '../data-only/functions';
import { JMusic } from '../facade/jmusic';
import { FlexibleSequence, flexibleItemToDef } from '../score/flexible-sequence';
import { VariableRepository, VariableRepositoryProxy } from '../score/variables';
import R = require('ramda');
import { ProjectDef, isProjectDef } from '../data-only/project';
import { VarDict } from '../data-only/variables';
import { FlexibleItem } from '../score/types';
import { lensItemOf, projectLensByIndex } from '../optics/lens';
import { ScoreFlex, makeScore } from '../facade/score-flex';
import { Clef } from '../states/clef';
import { parseLilyClef, parseLilyKey, parseLilyMeter } from '../score/sequence';
import { StateChange } from '../states/state';
import { ClefType } from '../data-only/states';

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


        
        it('should convert object sequence state changes to data-only sequence', () => {
            const conceptual: ConceptualSequence = [
                StateChange.newClefChange(parseLilyClef('\\clef treble')),
                StateChange.newMeterChange(parseLilyMeter('\\time 6/8')),
                StateChange.newKeyChange(parseLilyKey('\\key f \\minor'))
            ];
            const expected = [
                StateChange.newClefChange(parseLilyClef('\\clef treble')), // todo: we would like so use StateChangeDef instead of StateChange
                StateChange.newMeterChange(parseLilyMeter('\\time 6/8')),
                StateChange.newKeyChange(parseLilyKey('\\key f \\minor'))
            ];         
            
            const data = convertConceptualSequenceToData(conceptual);

            expect(data).to.deep.eq(expected);
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
            const conceptual = convertSequenceDataToConceptual(data, { });

            const elements = conceptualGetElements(conceptual);

            expect(elements).to.have.length(6);
            expect(elements[4]).to.deep.eq(createNoteFromLilypond('g4.'));
        });

        it('should apply functions content with a clef', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { function: 'Relative', args: ['a4 \\clef bass g4.'], extraArgs: ['c,'] } as SeqFunction];
            const conceptual = convertSequenceDataToConceptual(data, { });

            const elements = conceptualGetElements(conceptual);

            expect(elements).to.have.length(7);
            expect(elements[5]).to.deep.eq({ clef: Clef.clefBass, isState: true });
        });

        it('should support nested variables', () => {
            const bigDef = { 
                content: [[{ variable: 'theVar1' }, ['c4 d4 e4 f4', { variable: 'theVar2' }]], [[['c,4 d,4'], ['e,4'], 'f,4']]],
                meter: '6/8',
                clefs: [ 'alto', 'tenor' ],
                key: 'g \\minor'
            };
            
            const vars = { 
                theVar1: 'a4 g4 e4 d4',
                theVar2: ['aes4 ges4', { variable: 'theVar3' }, 'ees4 des4'],
                theVar3: { variable: 'theVar4' },
                theVar4: 'fis4 gis4 cis4 dis4'
            };

            const sc = new JMusic(bigDef, vars);
   
            const projectDef = {
                score: sc.project.score,
                vars: normalizeVars(vars)
            };

            const lens = projectLensByIndex(
                sc.domainConverter,
                {
                    staff: 0,
                    voice: 1,
                    element: 7
                });

            
            const res = R.set(lens, lensItemOf(createNoteFromLilypond('fis16')), projectDef);

            expect(res.vars.theVar4).to.deep.eq( ['fis4', 'fis16', 'cis4', 'dis4']);

        });


        it('should retain functions arguments when using normalizeVars', () => {
            const variablesAndFunctionsVars = {
                var1: ['c\'4.', 'd\'8'],
                var2: ['e\'4', 'g\'4'],
                varOfVars: [{variable: 'var2'}, {variable: 'var1'}],
                funcOfConst: [{ function: 'Transpose', args: ['c\'4.', 'd\'8'], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction],
                funcOfVar: [{ function: 'Transpose', args: [{variable: 'var1'}], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction]
            };
            const res = normalizeVars(variablesAndFunctionsVars);

            expect(res).to.deep.eq(variablesAndFunctionsVars);
        });

        it('should retain functions arguments when using normalizeVars', () => {
            const variablesAndFunctionsVars = {
                funcOfConst: [{ function: 'Transpose', args: ['c\'4. \\clef bass d\'8'], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction]
            };
            const variablesAndFunctionsVarsOut = {
                funcOfConst: [{ function: 'Transpose', args: ['c\'4.', { clef: Clef.clefBass, isState: true }, 'd\'8'], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction]
            };

            const res = normalizeVars(variablesAndFunctionsVars);

            expect(res).to.deep.eq(variablesAndFunctionsVarsOut);
        });

    });
});