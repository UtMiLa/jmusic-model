import { NoteViewModel } from '../../logical-view/view-model/note-view-model';
import { NoteDirection, NoteType } from '../../model/notes/note';
import { GlyphCode, HorizVarSizeGlyphs } from './glyphs';
import { Metrics } from './metrics';
import { PhysicalElementBase, PhysicalHorizVarSizeElement, PhysicalFixedSizeElement } from './physical-elements';
import { staffLineToY } from './functions';


export function testNote(viewModel: any): NoteViewModel | undefined {
    return viewModel.noteType ? viewModel as NoteViewModel : undefined;
}


export function convertNote(note: NoteViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    let glyph: GlyphCode;

    const result: PhysicalElementBase[] = [];

    const yPositions = note.positions.map(pos => staffLineToY(pos / 2, settings));

    const chordLength = yPositions[yPositions.length - 1] - yPositions[0];
    const stemBaseY = note.direction === NoteDirection.Up ? yPositions[0] : yPositions[yPositions.length - 1];
    const stemBaseX = note.direction === NoteDirection.Up ? xPos + settings.blackNoteHeadLeftXOffset : xPos + settings.blackNoteHeadRighttXOffset;
    const stemBaseXhalf = note.direction === NoteDirection.Up ? xPos + settings.halfNoteHeadLeftXOffset : xPos + settings.halfNoteHeadRightXOffset;
    const stemSign = note.direction === NoteDirection.Up ? 1 : -1;

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
                length: stemSign * (settings.quarterStemDefaultLength + chordLength),
                position: { x: stemBaseXhalf, y: stemBaseY }
            } as PhysicalHorizVarSizeElement);
            break;
        case NoteType.NQuarter: 
            glyph = 'noteheads.s2'; 
            result.push({
                element: HorizVarSizeGlyphs.Stem,
                length: stemSign * (settings.quarterStemDefaultLength + chordLength),
                position: { x: stemBaseX, y: stemBaseY }
            } as PhysicalHorizVarSizeElement);
            break;      
    }

    yPositions.forEach(yPos => {
        result.push({
            position: { x: xPos, y: yPos },
            glyph
        } as PhysicalFixedSizeElement);    
    });

    return result;
}
