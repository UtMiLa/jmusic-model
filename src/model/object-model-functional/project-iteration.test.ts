import { expect } from 'chai';
import { ProjectDef } from '../data-only/project';
import { NoteDirection } from '../data-only/notes';
import { Clef } from '../states/clef';
import { ActiveProject } from './types';
import { convertProjectDataToActive } from './def-to-active';
import { getProjectElements, getSelected, modifyProject } from './project-iteration';
import { createNoteFromLilypond } from '../notes/note';
import { pipe } from 'fp-ts/lib/function';
import { SelectionVoiceTime } from '~/selection/query';
import { Time } from '../rationals/time';
import { JMusic } from '../facade/jmusic';
import { convertProjectActiveToData } from './active-to-def';
import { augment } from '../score/music-event-functions';
import { isNote } from '../score/sequence';
import { elem } from 'fp-ts/lib/Option';

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
            expect(elems).to.have.length(8);
        });

        it('should iterate over elements in project', () => {
            const elems = getProjectElements(projectActive);
            expect(elems[2]).to.deep.eq({
                position: {
                    staffNo: 0,
                    voiceNo: 0,
                    elementNo: 2
                },
                path: ['score', 'staves', 0, 'voices', 0, 'content', 2, 0],
                element: createNoteFromLilypond('e4')
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
                path: [{ variable: 'v1'}, 0, 0],
                element: createNoteFromLilypond('e,4')
            });
        });

    });

    describe('Changing elements', () => {
        it('should should not change anything when modifier function is identity', () => {
            const newProj = pipe(
                projectActive,
                modifyProject(x => [x]),
                convertProjectActiveToData
            );

            expect(newProj).to.deep.eq(projectData);
        });
        
        it('should should change time on all timed events', () => {

            const augmenter = augment({ numerator: 1, denominator: 2 });

            const newProj = pipe(
                projectActive,
                modifyProject(augmenter),
                convertProjectActiveToData
            );

            expect(newProj.score.staves[0].voices[0].contentDef).to.deep.eq(['c8', 'd8', 'e8', 'f8']);
        });

        
        it('should should change time on referenced variables too', () => {

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
    });
});


