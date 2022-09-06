import { NoteViewModel, ClefViewModel, isClefVM } from './../score/staff';
import { Note, NoteType } from './../notes/note';
import { ClefDef } from './../states/clef';
import { Metrics } from './metrics';
import { VertVarSizeGlyphs, FixedSizeGlyphs, GlyphCode } from './glyphs';
import { ScoreViewModel } from './../score/score';
import { StaffViewModel } from './../score/staff';
import { PhysicalModel, PhysicalElementBase, PhysicalFixedSizeElement } from './physical-elements';

interface VMCondition<T> {
    if: (obj: unknown) => T | undefined;
    then: (obj: T) => void;
}


export function viewModelToPhysical(viewModel: ScoreViewModel, settings: Metrics): PhysicalModel {
    if (viewModel.staves.length) {
        const resultElements: PhysicalElementBase[] = [0, 1, 2, 3, 4].map(n => ({
            element: VertVarSizeGlyphs.Line,
            position: { x: 0, y: settings.staffLineWidth * (4 - n) },
            length: settings.staffLengthOffset
        }));

        let x = 30;

        viewModel.staves[0].objects.forEach(obj => {
            [
                { 
                    if: isClefVM, 
                    then: ((clef: ClefViewModel) => resultElements.push(convertClef(clef)))
                } as VMCondition<ClefViewModel>,

                { 
                    if: (obj: unknown) => obj as NoteViewModel, 
                    then: ((note: NoteViewModel) => { 
                        resultElements.push(convertNote(note, x));
                        x += 20;
                    })
                } as VMCondition<NoteViewModel>

            ].find((condition: VMCondition<any>) => {
                const tmp = condition.if(obj);
                if (tmp !== undefined) {
                    condition.then(tmp);
                }
                return tmp;
            });
          

        });

        return { 
            elements: resultElements            
        };
    }
    return { elements: [] };
}

function convertClef(clef: ClefViewModel): PhysicalElementBase {
    return {
        position: { x: 10, y: 10 },
        glyph: 'clefs.G'
    } as PhysicalFixedSizeElement;
}

function convertNote(note: NoteViewModel, xPos: number): PhysicalElementBase {
    let glyph: GlyphCode;

    switch(note.noteType) {
        case NoteType.NBreve: glyph = 'noteheads.sM1'; break;
        case NoteType.NWhole: glyph = 'noteheads.s0'; break;
        case NoteType.NHalf: glyph = 'noteheads.s1'; break;
        case NoteType.NQuarter: glyph = 'noteheads.s2'; break;      
    }

    return {
        position: { x: xPos, y: note.positions[0] * 5 + 20 },
        glyph
    } as PhysicalFixedSizeElement;
}
