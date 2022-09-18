import { FlagType, NoteViewModel } from '../../logical-view/view-model/note-view-model';
import { NoteDirection, NoteType } from '../../model/notes/note';
import { GlyphCode, HorizVarSizeGlyphs, FixedSizeGlyphs } from './glyphs';
import { Metrics } from './metrics';
import { PhysicalElementBase, PhysicalHorizVarSizeElement, PhysicalFixedSizeElement } from './physical-elements';
import { staffLineToY } from './functions';


export function testNote(viewModel: any): NoteViewModel | undefined {
    return viewModel.noteType ? viewModel as NoteViewModel : undefined;
}


export function convertNote(note: NoteViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    let glyph: GlyphCode;

    const result: PhysicalElementBase[] = [];
    const directionUp = note.direction === NoteDirection.Up;

    const yPositions = note.positions.map(pos => staffLineToY(pos / 2, settings));

    const chordLength = yPositions[yPositions.length - 1] - yPositions[0];
    const stemBaseY = directionUp ? yPositions[0] : yPositions[yPositions.length - 1];
    const stemBaseX = directionUp ? xPos + settings.blackNoteHeadLeftXOffset : xPos + settings.blackNoteHeadRightXOffset;
    const stemBaseXhalf = directionUp ? xPos + settings.halfNoteHeadLeftXOffset : xPos + settings.halfNoteHeadRightXOffset;
    const stemSign = directionUp ? 1 : -1;

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
            if (note.flagType) {
                let glyph: GlyphCode;
                switch (note.flagType) {
                    case FlagType.F1: 
                        glyph = directionUp ? 'flags.u3' : 'flags.d3';
                        break;
                    case FlagType.F2: 
                        glyph = directionUp ? 'flags.u4' : 'flags.d4';
                        break;
                    case FlagType.F3: 
                        glyph = directionUp ? 'flags.u5' : 'flags.d5';
                        break;
                    case FlagType.F4: 
                        glyph = directionUp ? 'flags.u6' : 'flags.d6';
                        break;
                    case FlagType.F5: 
                        glyph = directionUp ? 'flags.u7' : 'flags.d7';
                        break;
                }
                result.push({
                    position: { x: stemBaseX, y: stemBaseY + stemSign * (settings.quarterStemDefaultLength + chordLength) },
                    glyph
                } as PhysicalFixedSizeElement);    
            }

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
