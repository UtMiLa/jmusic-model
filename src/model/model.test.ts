import { Clef, Key, Model, ProjectDef, SeqFunction, Time, cloneNote, createNoteFromLilypond } from '.';
import { convertProjectDataToActive } from './active-project/def-to-active';
import { VoiceContentDef } from './data-only/voices';
import { expect } from 'chai';

describe('Model', () => {

    it('should create a project with tuples from an active project', () => {
        const data: VoiceContentDef = ['c4 d4 e4 f4', { function: 'Tuplet', extraArgs: [Time.newSpan(2, 3)], args: ['a4 g4 b4'] } as SeqFunction];
        const projDef: ProjectDef =  {
            score: {
                staves: [
                    { 
                        voices: [
                            {
                                contentDef: data
                            }
                        ],
                        initialClef: Clef.clefTenor.def,
                        initialKey: { accidental: 1, count: 1 }
                    }
                ]
            },
            vars: {}
        };
        const active = convertProjectDataToActive(projDef);

        const model = new Model(active);

        expect(model.staves).to.have.length(1);
        expect(model.staves[0].voices).to.have.length(1);
        expect(model.staves[0].voices[0].content.elements).to.have.length(7);
        expect(model.staves[0].voices[0].content.elements[5]).to.deep.eq(cloneNote(createNoteFromLilypond('g4'), {
            tupletFactor: Time.newSpan(2, 3),
            tupletGroup: 2
        }));
    });
});