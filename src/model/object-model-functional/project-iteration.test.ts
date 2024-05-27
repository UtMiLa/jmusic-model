import { SelectionManager } from './../../selection/selection-types';
import { expect } from 'chai';
import { ProjectDef } from '../data-only/project';
import { NoteDirection } from '../data-only/notes';
import { Clef } from '../states/clef';
import { ActiveProject } from './types';
import { convertProjectDataToActive } from './def-to-active';
import { getProjectElements, getSelected } from './project-iteration';
import { createNoteFromLilypond } from '../notes/note';
import { pipe } from 'fp-ts/lib/function';
import { SelectionVoiceTime } from '~/selection/query';
import { Time } from '../rationals/time';
import { JMusic } from '../facade/jmusic';

describe('Iterating project', () => {
    let projectData: ProjectDef;
    let projectActive: ActiveProject;

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
        projectActive = convertProjectDataToActive(projectData);
    });

    it('should iterate over elements in project', () => {
        const elems = getProjectElements(projectActive);
        expect(elems).to.have.length(8);
    });

    it('should iterate over elements in project', () => {
        const elems = getProjectElements(projectActive);
        expect(elems[2]).to.deep.include({
            position: {
                staffNo: 0,
                voiceNo: 0,
                elementNo: 2
            },
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
        expect(elems[2]).to.deep.include({
            position: {
                staffNo: 0,
                voiceNo: 1,
                elementNo: 2
            },
            element: createNoteFromLilypond('e,4')
        });
    });

});