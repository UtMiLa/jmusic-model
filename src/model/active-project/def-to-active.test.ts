import { expect } from 'chai';
import { NoteDirection } from '../data-only/notes';
import { ProjectDef } from '../data-only/project';
import { createNoteFromLilypond } from '../notes/note';
import { Clef } from '../states/clef';
import { DiatonicKey, Key } from '../states/key';
import { convertVoiceDataToActive, convertStaffDataToActive, convertScoreDataToActive, convertProjectDataToActive } from './def-to-active';
import { ActiveVarRepo } from './types';


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
        expect(active.item.initialClef).to.deep.eq(Clef.create(projectData.score.staves[0].initialClef));
        expect(active.item.initialKey).to.deep.eq(Key.create(projectData.score.staves[0].initialKey));
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

