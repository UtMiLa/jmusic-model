import { NoteViewModel } from '~/view-model/convert-model';
import { NoteType } from '../notes/note';
import { GlyphCode, HorizVarSizeGlyphs } from './glyphs';
import { Metrics } from './metrics';
import { PhysicalElementBase, PhysicalHorizVarSizeElement, PhysicalFixedSizeElement } from './physical-elements';
import { staffLineToY } from './viewmodel-to-physical';

export function testNote(viewModel: any): NoteViewModel | undefined {
    return viewModel.noteType ? viewModel as NoteViewModel : undefined;
}


export function convertNote(note: NoteViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    let glyph: GlyphCode;

    const result: PhysicalElementBase[] = [];

    const yPos = staffLineToY(note.positions[0] / 2, settings);

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
