import { expect } from 'chai';
import { NoteDirection } from '../data-only/notes';
import { ProjectDef } from '../data-only/project';
import { createNoteFromLilypond } from '../notes/note';
import { Clef } from '../states/clef';
import { convertVoiceActiveToData, convertStaffActiveToData, convertScoreActiveToData, convertProjectActiveToData } from './active-to-def';
import { convertProjectDataToActive } from './def-to-active';
import { ActiveProject, ActiveVarRepo } from './types';



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