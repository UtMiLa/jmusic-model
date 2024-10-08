import { Interval } from '../pitches/intervals';
import { expect } from 'chai';
import { ProjectDef } from '../data-only/project';
import { NoteDirection } from '../data-only/notes';
import { Clef } from '../states/clef';
import { ActiveFunctionCall, ActiveProject, ElementDescriptor } from './types';
import { convertProjectDataToActive } from './def-to-active';
import { getProjectElements, getSelected, modifyProject } from './project-iteration';
import { createNoteFromLilypond } from '../notes/note';
import { pipe } from 'fp-ts/lib/function';
import { SelectionVoiceTime } from '../../selection/query';
import { Time } from '../rationals/time';
import { JMusic } from '../../facade/jmusic';
import { convertProjectActiveToData } from './active-to-def';
import { augment } from '../score/music-event-functions';
import { MusicEvent, isNote } from '../score/sequence';
import { elem } from 'fp-ts/lib/Option';
import { VariableDef } from '../data-only/variables';

describe('Iterating project', () => {
    let projectData: ProjectDef;
    let projectActive: ActiveProject;

    beforeEach(() => {
        projectData = {
            score: {
                staves: [{
                    voices: [
                        {
                            contentDef: ['c4', 'd4', 'e4', 'f4'],
                            noteDirection: NoteDirection.Up
                        },
                        {
                            contentDef: ['c,4', 'd,4', { variable: 'v1'}],
                            noteDirection: NoteDirection.Down
                        },
                        {
                            contentDef: ['c,4', 'd,4', { function: 'Transpose', args: ['c,,4', 'd,,4'], extraArgs: [{alteration: 1, interval: 1} as  Interval] }],
                            noteDirection: NoteDirection.Down
                        }
                    ],
                    initialClef: Clef.clefBass.def,
                    initialKey: { accidental: 0, count: 0 }
                }]
            },
            vars: {
                v0: ['e,4', 'f,4'],
                v1: ['e,4', 'f,4']
            }
        };
        projectActive = convertProjectDataToActive(projectData);
    });

    describe('Getting elements', () => {
        it('should iterate over elements in project', () => {
            const elems = getProjectElements(projectActive);
            expect(elems).to.have.length(12);
        });

        it('should iterate over elements in project', () => {
            const elems = getProjectElements(projectActive);
            expect(elems[2]).to.deep.eq({
                position: {
                    staffNo: 0,
                    voiceNo: 0,
                    elementNo: 2
                },
                path: ['score', 'staves', 0, 'voices', 0, 'content', 2],
                element: createNoteFromLilypond('e4'),
                functionPath: []
            });
        });

        
        it('should filter selected elements in project', () => {
            const selection = new SelectionVoiceTime(new JMusic(projectData), 0, 1, Time.StartTime, Time.EternityTime);

            const elems = pipe(
                projectActive,
                getProjectElements,
                getSelected(selection)
            );
            expect(elems).to.have.length(4);
            expect(elems[2]).to.deep.eq({
                position: {
                    staffNo: 0,
                    voiceNo: 1,
                    elementNo: 2
                },
                path: [2, { variable: 'v1'}, 0],
                element: createNoteFromLilypond('e,4'),
                functionPath: []
            });
        });

    });

    describe('Changing elements', () => {
        it('should not change anything when modifier function is identity', () => {
            const newProj = pipe(
                projectActive,
                modifyProject(x => [x]),
                convertProjectActiveToData
            );

            expect(newProj).to.deep.eq(projectData);
        });
        
        it('should change time on all timed events', () => {

            const augmenter = augment({ numerator: 1, denominator: 2 });

            const newProj = pipe(
                projectActive,
                modifyProject(augmenter),
                convertProjectActiveToData
            );

            expect(newProj.score.staves[0].voices[0].contentDef).to.deep.eq(['c8', 'd8', 'e8', 'f8']);
        });

        
        it('should change time on referenced variables too', () => {

            const augmenter = augment({ numerator: 1, denominator: 2 });

            const newProj = pipe(
                projectActive,
                modifyProject(augmenter),
                convertProjectActiveToData
            );

            expect(newProj.vars).to.deep.eq({
                v0: ['e,4', 'f,4'],
                v1: ['e,8', 'f,8']
            });
            
        });


        
        it('should change time on function arguments too', () => {

            const augmenter = augment({ numerator: 1, denominator: 2 });

            const newProj = pipe(
                projectActive,
                modifyProject(augmenter),
                convertProjectActiveToData
            );

            expect(newProj.score.staves[0].voices[2].contentDef).to.deep.eq([
                'c,8', 'd,8', 
                { function: 'Transpose', args: ['c,,8', 'd,,8'], extraArgs: [{alteration: 1, interval: 1} as  Interval] }
            ]);

            /*expect(projectActive.score.staves[0].voices[2].content).to.deep.eq([
                createNoteFromLilypond('c,4'), createNoteFromLilypond('d,4'), 
                { 
                    type: 'Func',
                    name: 'Transpose', 
                    items: [
                        createNoteFromLilypond('c,,4'), 
                        createNoteFromLilypond('d,,4')
                    ], 
                    extraArgs: [{alteration: 1, interval: 1} as  Interval] ,
                    duration: Time.HalfTime
                }
            ]);

            expect(newProj.score.staves[0].voices[2].content).to.deep.eq([
                createNoteFromLilypond('c,8'), createNoteFromLilypond('d,8'), 
                { 
                    type: 'Func',
                    name: 'Transpose', 
                    items: [
                        createNoteFromLilypond('c,,8'), 
                        createNoteFromLilypond('d,,8')
                    ], 
                    extraArgs: [{alteration: 1, interval: 1} as  Interval] ,
                    duration: Time.HalfTime
                }
            ]);*/
        });


        
        it('should double notes on voices and referenced variables', () => {

            const newProj = pipe(
                projectActive,
                modifyProject(element => isNote(element) ? [element, element] : [element]),
                convertProjectActiveToData
            );

            expect(newProj.score.staves[0].voices[0].contentDef).to.deep.eq(['c4', 'c4', 'd4', 'd4', 'e4', 'e4', 'f4', 'f4']);
            expect(newProj.vars).to.deep.eq({
                v0: ['e,4', 'f,4'],
                v1: ['e,4', 'e,4', 'f,4', 'f,4']
            });
            
        });


        it('should fail when updating non-invertible function', () => {

            projectData.score.staves[0].voices[2].contentDef = ['c,4', 'd,4', { function: 'Rest', args: ['c,,4', 'd,,4'] }];
            const projectActive1 = convertProjectDataToActive(projectData);

            expect(() => modifyProject(element => isNote(element) ? [element, element] : [element])(projectActive1)).to.throw(/Cannot invert/);
        });

    });


    describe('Complex functions and variables', () => { // todo: should allow editing nested variables and functions

        let projectData: ProjectDef;
        let projectActive: ActiveProject;
        let projectElements: ElementDescriptor[];
    
        beforeEach(() => {
            projectData = {
                score: {
                    staves: [{
                        voices: [
                            {
                                contentDef: ['c4', 'd4', { variable: 'v0'}], //6
                                noteDirection: NoteDirection.Up
                            },
                            {
                                contentDef: ['c,4', 'd,4', { variable: 'v2'}], //5
                                noteDirection: NoteDirection.Down
                            },
                            {
                                contentDef: ['c,4', 'd,4', { //5
                                    function: 'Transpose', 
                                    args: ['c,,4', { 
                                        function: 'Augment', args: ['c,,4', 'd,,4'], extraArgs: [{ numerator: 1, denominator: 2 }] 
                                    }], 
                                    extraArgs: [{alteration: 1, interval: 1} as  Interval] 
                                }],
                                noteDirection: NoteDirection.Down
                            }
                        ],
                        initialClef: Clef.clefBass.def,
                        initialKey: { accidental: 0, count: 0 }
                    },
                
                    {
                        voices: [
                            {
                                contentDef: ['c,4', 'd,4', { 
                                    function: 'Transpose', 
                                    args: ['c,,4', { variable: 'v1' }], 
                                    extraArgs: [{alteration: 1, interval: 1} as  Interval] 
                                }],
                                noteDirection: NoteDirection.Undefined
                            }
                        ],
                        initialClef: Clef.clefBass.def,
                        initialKey: { accidental: 0, count: 0 }
                    }
                    ]
                },
                vars: {
                    v0: ['e,4', { function: 'Transpose', args: ['c,,4', { variable: 'v1'}], extraArgs: [{alteration: 1, interval: 1} as  Interval] }],
                    v1: ['e,4', 'f,4'],
                    v2: ['e,4', { variable: 'v1'}]
                }
            };
            projectActive = convertProjectDataToActive(projectData);

            projectElements = getProjectElements(projectActive);
        });
    

        it('should resolve correct path to a var in a var', () => {
            expect(projectElements[9].path).to.deep.eq([2, { variable: 'v2' }, 1, { variable: 'v1' }, 0]);
        });
        it('should resolve correct function path to a functionless element', () => {
            expect(projectElements[9].functionPath).to.deep.eq([]);
        });

        it('should resolve correct path to a function of a var', () => {
            expect(projectElements[20].path).to.deep.eq([2, 'args', 1, { variable: 'v1' }, 1]); // this is uncertain
        });
        it('should resolve correct function path to a function of a var', () => {
            expect(projectElements[20].functionPath).to.deep.eq([{ function: 'Transpose', extraArgs: [{alteration: 1, interval: 1} as  Interval] }]);
        });
        it('should resolve correct path to a function in a var', () => {
            expect(projectElements[3].path).to.deep.eq([2, { variable: 'v0' }, 1, 'args', 0]);
        });
        xit('should resolve correct function path to a function in a var', () => { // todo: functions of function need thorough analysis
            expect(projectElements[3].functionPath).to.deep.eq([{ function: 'Transpose', extraArgs: [{alteration: 1, interval: 1} as  Interval] }]);
        });
        /*
        
        Thoughts about functions:
            * no problem when one note -> one note with inverse function
            * when not inversible:
            * * if pitch(es) are inversible but not times, it can allow changing pitches but fail when changing times
            * * if times are inversible but not pitches, it can allow changing times but fail when changing pitches
            * when one note -> many notes, it might be possible to change both pitch and time, depending on function
            * when many notes -> one note, it is probably not possible to edit directly
            * functions should not just calculate results, but also provide some means for identifying original note
            * functions can have defined a descriptor about which parts are editable
        Sometimes it might be adviceable to prompt the user (using DialogProvider) if a partially reversible function should be:
            * ignored, but make rest of the edits
            * flattened (function(values) replaced by calculated values)
            * partially applied (using best guess)
            * open function argument in a new editor
            * abort whole edit
        */
        it('should resolve correct path to a function of a function', () => {
            expect(projectElements[15].path).to.deep.eq(['score', 'staves', 0, 'voices', 2, 'content', 2, 'args', 1, 'args', 1]);
        });
        xit('should resolve correct function path to a function of a function', () => { // todo: functions of function need thorough analysis
            expect(projectElements[15].functionPath).to.deep.eq([
                { 
                    function: 'Transpose', extraArgs: [{alteration: 1, interval: 1} as  Interval] 
                },
                { 
                    function: 'Augment', args: ['c,,4', 'd,,4'], extraArgs: [{ numerator: 1, denominator: 2 }] 
                }
            ]);
        });

        it('should replace correctly a nested function', () => {
            
            const newProj = pipe(
                projectActive,
                modifyProject(element => isNote(element) ? [element, createNoteFromLilypond('c4')] : [element]),
                convertProjectActiveToData
            );

            // path does find [v0 0] and [v0 1 args 0], but not [v0 1 args 1 var v1 0] (say [v0 1 args 1])
            expect(newProj.score.staves[0].voices[2].contentDef).to.deep.eq(['c,4', 'c4', 'd,4', 'c4', { 
                function: 'Transpose', 
                args: ['c,,4', 'bes,4', { 
                    function: 'Augment', args: ['c,,4', 'bes,2', 'd,,4', 'bes,2'], extraArgs: [{ numerator: 1, denominator: 2 }] 
                }], 
                extraArgs: [{alteration: 1, interval: 1} as  Interval]
            }]);
            //expect(newProj.vars).to.deep.eq(projectData.vars);
        });



        it('should replace correctly a nested variable', () => {            
            const newProj = pipe(
                projectActive,
                modifyProject(element => isNote(element) ? [element, createNoteFromLilypond('c4')] : [element]),
                convertProjectActiveToData
            ); 
            // todo: make clear how to replace when a variable is referenced more than once in the selection. As of now, it makes the first replacement only.
            // [path [v2 v1 x] should match [v1 x] ]
            expect(newProj.vars).to.deep.eq({
                v0: ['e,4', 'c4', { function: 'Transpose', args: ['c,,4', 'bes,4', { variable: 'v1'}], extraArgs: [{alteration: 1, interval: 1} as  Interval] }],
                v1: ['e,4', 'c4', 'f,4', 'c4'],
                v2: ['e,4', 'c4', { variable: 'v1'}]
            });
        });

        
        xit('should replace correctly a function of a variable', () => {
            const model = new JMusic(projectData);

            const newProj = pipe(
                projectActive,
                modifyProject(element => isNote(element) ? [element, createNoteFromLilypond('c4')] : [element], new SelectionVoiceTime(model, 1, 0, Time.StartTime, Time.EternityTime)),
                convertProjectActiveToData
            );
            // [path [v2 v1 x] should match [v1 x] ]
            expect(newProj.vars).to.deep.eq({
                v0: ['e,4', { function: 'Transpose', args: ['c,,4', { variable: 'v1'}], extraArgs: [{alteration: 1, interval: 1} as  Interval] }],
                v1: ['e,4', 'bes,4', 'f,4', 'bes,4'],
                v2: ['e,4', { variable: 'v1'}]
            });
        });


    });

    describe('Bugfixes', () => {
        /*it('should not transpose notes in function arguments', () => {
            const changes = [{ element: createNoteFromLilypond('c4'), path: ['score', 0, 'args', 0], position: {elementNo: 0, voiceNo: 0, staffNo: 0} } as ElementDescriptor ];
            //const modifier = (a: MusicEvent) => [a, a];
            const augmenter = augment({ numerator: 1, denominator: 2 });
            const res = _internal.modifySeq(['score'],
                changes,
                augmenter
            )([{ type: 'Func', name: 'Transpose', extraArgs: [{ interval: 1, alteration: 1 } as Interval], items: [createNoteFromLilypond('c4')] } as ActiveFunctionCall]);

            expect(res).to.deep.eq([
                { 
                    type: 'Func', 
                    name: 'Transpose', 
                    items: [createNoteFromLilypond('c8')],
                    extraArgs: [{ interval: 1, alteration: 1 } as Interval]
                } as ActiveFunctionCall
            ]);
        });*/

    });
});


