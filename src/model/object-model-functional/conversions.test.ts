import { Time } from './../rationals/time';
import { expect } from 'chai';
import { VoiceContentDef, VoiceDef } from '../data-only/voices';
import { activeGetElements, convertActiveSequenceToData, convertProjectActiveToData, convertProjectDataToActive, convertScoreActiveToData, convertScoreDataToActive, convertSequenceDataToActive, convertStaffActiveToData, convertStaffDataToActive, convertVoiceActiveToData, convertVoiceDataToActive, normalizeVars } from './conversions';
import { createNoteFromLilypond } from '../notes/note';
import { ActiveFunctionCall, ActiveProject, ActiveSequence, ActiveVarRef, ActiveVarRepo } from './types';
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
import { NoteDirection } from '../data-only/notes';
import { ScoreDef, StaffDef } from '../data-only/score';
import { Key } from '../states/key';

describe('Conversions', () => {
    describe('Conversions from def to active', () => {
        it('should convert data-only sequence to object sequence', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4'];
            
            const active = convertSequenceDataToActive(data, {});

            expect(active.length).to.eq(4);
            expect(active[2]).to.deep.eq(createNoteFromLilypond('e4'));
        });

        
        it('should convert data-only sequence with variable references to object sequence', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { variable: 'xx'}];

            const active = convertSequenceDataToActive(data, { xx: ['g4 a4.']});

            expect(active.length).to.eq(5);
            const varref = active[4] as ActiveVarRef;
            expect(varref.name).to.deep.eq('xx');
            expect(varref.items).to.have.length(2);
            expect(varref.items[0]).to.deep.eq(createNoteFromLilypond('g4'));
            expect(varref.duration).to.deep.eq(Time.newSpan(5, 8));
        });

        it('should convert data-only sequence with function calls to object sequence', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { function: 'Reverse', args: ['a4 g4.'] } as SeqFunction];

            const active = convertSequenceDataToActive(data, {});

            expect(active.length).to.eq(5);
            const funcref = active[4] as ActiveFunctionCall;
            expect(funcref.func).to.deep.eq('Reverse');
            expect(funcref.items).to.have.length(2);
            expect(funcref.items[0]).to.deep.eq(createNoteFromLilypond('a4'));
            expect(funcref.duration).to.deep.eq(Time.newSpan(5, 8));
        });
    });
    //const data = createTestScore([['c4 d4 e4 f4']], [4, 4], [3, -1]);


    describe('Conversions from active to def', () => {
        it('should convert object sequence to data-only sequence', () => {
            const active: ActiveSequence = [
                createNoteFromLilypond('c4'), 
                createNoteFromLilypond('d4'), 
                createNoteFromLilypond('e4'), 
                createNoteFromLilypond('f4')
            ];
            
            const data = convertActiveSequenceToData(active);

            expect(data).to.deep.eq(['c4', 'd4', 'e4', 'f4']);
        });

        
        it('should convert object sequence with variable reference to data-only sequence', () => {
            const active: ActiveSequence = [
                createNoteFromLilypond('c4'), 
                createNoteFromLilypond('d4'), 
                createNoteFromLilypond('e4'), 
                createNoteFromLilypond('f4'),
                {
                    type: 'VarRef',
                    name: 'xxx',
                    items: [],
                    duration: Time.newSpan(1, 2)
                } as ActiveVarRef
            ];
            
            const data = convertActiveSequenceToData(active);

            expect(data).to.deep.eq(['c4', 'd4', 'e4', 'f4', { variable: 'xxx' }]);
        });
        it('should convert object sequence with function call to data-only sequence', () => {
            const active: ActiveSequence = [
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
                } as ActiveFunctionCall
            ];
            
            const data = convertActiveSequenceToData(active);

            expect(data).to.deep.eq(['c4', 'd4', 'e4', 'f4', { function: 'Reverse', args: ['g4', 'a4.'] }]);
        });


        
        it('should convert object sequence state changes to data-only sequence', () => {
            const active: ActiveSequence = [
                StateChange.newClefChange(parseLilyClef('\\clef treble')),
                StateChange.newMeterChange(parseLilyMeter('\\time 6/8')),
                StateChange.newKeyChange(parseLilyKey('\\key f \\minor'))
            ];
            const expected = [
                StateChange.newClefChange(parseLilyClef('\\clef treble')), // todo: we would like to use StateChangeDef instead of StateChange
                StateChange.newMeterChange(parseLilyMeter('\\time 6/8')),
                StateChange.newKeyChange(parseLilyKey('\\key f \\minor'))
            ];         
            
            const data = convertActiveSequenceToData(active);

            expect(data).to.deep.eq(expected);
        });
    });

    describe('Applying functions and variables', () => { 
        it('should apply content without variables and functions', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4'];
            const active = convertSequenceDataToActive(data, {});

            const elements = activeGetElements(active);

            expect(elements).to.have.length(4);
            expect(elements[2]).to.deep.eq(createNoteFromLilypond('e4'));
        });
        it('should apply variables\' content', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { variable: 'xx'}];
            const active = convertSequenceDataToActive(data, { xx: ['g4 a4.']});

            const elements = activeGetElements(active);

            expect(elements).to.have.length(6);
            expect(elements[5]).to.deep.eq(createNoteFromLilypond('a4.'));
        });
        it('should apply functions content', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { function: 'Reverse', args: ['a4 g4.'] } as SeqFunction];
            const active = convertSequenceDataToActive(data, { });

            const elements = activeGetElements(active);

            expect(elements).to.have.length(6);
            expect(elements[4]).to.deep.eq(createNoteFromLilypond('g4.'));
        });

        it('should apply functions content with a clef', () => {
            const data: VoiceContentDef = ['c4 d4 e4 f4', { function: 'Relative', args: ['a4 \\clef bass g4.'], extraArgs: ['c,'] } as SeqFunction];
            const active = convertSequenceDataToActive(data, { });

            const elements = activeGetElements(active);

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

    describe('Converting scores and staves etc from def to active', () => {
        let projectData: ProjectDef;
        let activeVars: ActiveVarRepo;

        beforeEach(() => {
            projectData = {
                score: {
                    staves: [{
                        voices: [
                            {
                                contentDef: ['c4 d4 e4 f4'],
                                noteDirection: NoteDirection.Up
                            },
                            {
                                contentDef: ['c,4 d,4', { variable: 'v1'}],
                                noteDirection: NoteDirection.Down
                            }
                        ],
                        initialClef: Clef.clefBass.def,
                        initialKey: { accidental: 0, count: 0 }
                    }]
                },
                vars: {
                    v1: 'e,4 f,4'
                }
            };
            activeVars = { 
                v1: [createNoteFromLilypond('e,4'), createNoteFromLilypond('f,4')]
            };
        });
        
        it('should convert data-only voice to active voice', () => {
            const data = projectData.score.staves[0].voices[0];
            
            const active = convertVoiceDataToActive(data, projectData.vars);

            expect(active.item.content.length).to.eq(4);
            expect(active.item.content[2]).to.deep.eq(createNoteFromLilypond('e4'));
            expect(active.item.noteDirection).to.eq(NoteDirection.Up);
            expect(active.vars).to.deep.eq(activeVars);
        });

        it('should convert data-only staff to active staff', () => {
            const data = projectData.score.staves[0];
            
            const active = convertStaffDataToActive(data, projectData.vars);

            expect(active.item.voices[0].content.length).to.eq(4);
            expect(active.item.voices[1].content[2]).to.include({ name: 'v1', type: 'VarRef' });
            expect(active.item.initialClef).to.deep.eq(new Clef(projectData.score.staves[0].initialClef));
            expect(active.item.initialKey).to.deep.eq(new Key(projectData.score.staves[0].initialKey));
            expect(active.vars).to.deep.eq(activeVars);
        });
     
        it('should convert data-only score to active score', () => {
            const data = projectData.score;
            
            const active = convertScoreDataToActive(data, projectData.vars);

            expect(active.item.staves[0].voices[0].content.length).to.eq(4);
            expect(active.item.staves[0].voices[1].content[2]).to.include({ name: 'v1', type: 'VarRef' });
            expect(active.vars).to.deep.eq(activeVars);
        });
     
        
        it('should convert data-only project to active project', () => {
            const data = projectData;
            
            const active = convertProjectDataToActive(data);

            expect(active.score.staves[0].voices[0].content.length).to.eq(4);
            expect(active.score.staves[0].voices[1].content[2]).to.include({ name: 'v1', type: 'VarRef' });
            expect(active.vars).to.deep.eq(activeVars);
        });
    
    });







    describe('Converting scores and staves etc from active to def', () => {
        let projectData: ProjectDef;
        let projectActive: ActiveProject;
        let activeVars: ActiveVarRepo;

        beforeEach(() => {
            projectData = {
                score: {
                    staves: [{
                        voices: [
                            {
                                contentDef: ['c4 d4 e4 f4'],
                                noteDirection: NoteDirection.Up
                            },
                            {
                                contentDef: ['c,4 d,4', { variable: 'v1'}],
                                noteDirection: NoteDirection.Down
                            }
                        ],
                        initialClef: Clef.clefBass.def,
                        initialKey: { accidental: 0, count: 0 }
                    }]
                },
                vars: {
                    v1: 'e,4 f,4'
                }
            };
            activeVars = { 
                v1: [createNoteFromLilypond('e,4'), createNoteFromLilypond('f,4')]
            };

            projectActive = convertProjectDataToActive(projectData); // maybe we should just construct it directly from objects
        });
        
        it('should convert active voice to data-only voice', () => {
            const data = projectActive.score.staves[0].voices[0];
            
            const active = convertVoiceActiveToData(data);

            expect((active.contentDef as any[]).length).to.eq(4);
            expect((active.contentDef as any[])[2]).to.deep.eq('e4');
            expect(active).to.deep.eq({
                contentDef: ['c4', 'd4', 'e4','f4'],
                noteDirection: NoteDirection.Up
            });
        });

        it('should convert active staff to data-only staff', () => {
            const data = projectActive.score.staves[0];
            
            const active = convertStaffActiveToData(data);

            expect(active.voices[0].contentDef).to.have.length(4);
            expect((active.voices[1].contentDef as any[])[2]).to.include({ variable: 'v1' });
            expect(active.initialClef).to.deep.eq(projectData.score.staves[0].initialClef);
            expect(active.initialKey).to.deep.eq(projectData.score.staves[0].initialKey);
            
        });
     
        it('should convert active score to data-only score', () => {
            const data = projectActive.score;
            
            const active = convertScoreActiveToData(data);

            expect(active.staves[0].voices[0].contentDef).to.have.length(4);
            expect((active.staves[0].voices[1].contentDef as any[])[2]).to.include({ variable: 'v1' });
        });
     
        
        it('should convert active project to data-only project', () => {
            const data = projectActive;
            
            const active = convertProjectActiveToData(data);

            expect(active.score.staves[0].voices[0].contentDef).to.have.length(4);
            expect(active.score.staves[0].initialKey).to.deep.eq({ accidental: 0, count: 0 });
            expect(active.vars).to.deep.eq({
                v1: ['e,4', 'f,4']
            });
        });
    
    });
});