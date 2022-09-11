import { NoteViewModel, ClefViewModel, isClefVM } from './../score/staff';
import { Note, NoteType } from './../notes/note';
import { ClefDef, ClefType } from './../states/clef';
import { Metrics } from './metrics';
import { VertVarSizeGlyphs, FixedSizeGlyphs, GlyphCode, HorizVarSizeGlyphs } from './glyphs';
import { ScoreViewModel } from './../score/score';
import { StaffViewModel } from './../score/staff';
import { PhysicalModel, PhysicalElementBase, PhysicalFixedSizeElement, PhysicalVertVarSizeElement, PhysicalHorizVarSizeElement } from './physical-elements';

/**
 * Physical Model
 * 
 * x origin is at beginning of staff; positive to the right.
 * y origin is at the bottom line of the staff; positive upwards.
 * 
 */

interface VMCondition<T> {
    if: (obj: unknown) => T | undefined;
    then: (obj: T) => void;
}

export function staffLineToY(staffLine: number, settings: Metrics): number {
    return settings.staffLineWidth - (-1 - staffLine) * settings.staffLineWidth;
}

export function viewModelToPhysical(viewModel: ScoreViewModel, settings: Metrics): PhysicalModel {
    if (viewModel.staves.length) {
        let resultElements: PhysicalElementBase[] = [0, 1, 2, 3, 4].map(n => ({
            element: VertVarSizeGlyphs.Line,
            position: { x: 0, y: settings.staffLineWidth * (4 - n) },
            length: settings.staffLengthOffset
        }));

        let x = 30;

        viewModel.staves[0].objects.forEach(obj => {
            [
                { 
                    if: isClefVM, 
                    then: ((clef: ClefViewModel) => resultElements.push(convertClef(clef, settings)))
                } as VMCondition<ClefViewModel>,

                { 
                    if: (obj: unknown) => obj as NoteViewModel, 
                    then: ((note: NoteViewModel) => { 
                        resultElements = resultElements.concat(convertNote(note, x, settings));
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

function convertClef(clef: ClefViewModel, settings: Metrics): PhysicalElementBase {
    let glyph: GlyphCode;

    switch(clef.clefType) {
        case ClefType.C: glyph = 'clefs.C'; break;
        case ClefType.F: glyph = 'clefs.F'; break;
        case ClefType.G: glyph = 'clefs.G'; break;
        case ClefType.G8: glyph = 'clefs.G'; break;
    }

    return {
        position: { x: 10, y: staffLineToY(clef.line/2, settings) },
        glyph
    } as PhysicalFixedSizeElement;
}

function convertNote(note: NoteViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    let glyph: GlyphCode;

    const result: PhysicalElementBase[] = [];

    const yPos = staffLineToY(note.positions[0] / 2, settings);// (note.positions[0] + 4) * settings.staffLineWidth / 2;

    switch(note.noteType) {
        case NoteType.NBreve: 
            glyph = 'noteheads.sM1'; 
            break;
        case NoteType.NWhole: 
            glyph = 'noteheads.s0'; 
            break;
        case NoteType.NHalf: 
            glyph = 'noteheads.s1';
            result.push({
                element: HorizVarSizeGlyphs.Stem,
                length: settings.quarterStemDefaultLength,
                position: { x: xPos + settings.halfNoteHeadLeftXOffset, y: yPos }
            } as PhysicalHorizVarSizeElement);
            break;
        case NoteType.NQuarter: 
            glyph = 'noteheads.s2'; 
            result.push({
                element: HorizVarSizeGlyphs.Stem,
                length: settings.quarterStemDefaultLength,
                position: { x: xPos + settings.blackNoteHeadLeftXOffset, y: yPos }
            } as PhysicalHorizVarSizeElement);
            break;      
    }

    result.push({
        position: { x: xPos, y: yPos },
        glyph
    } as PhysicalFixedSizeElement);

    return result;
}
