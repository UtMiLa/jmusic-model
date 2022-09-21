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


    if (!note.positions.length) {
        // rest
        let glyph: GlyphCode;
        switch(note.noteType) {
            case NoteType.RBreve: glyph = 'rests.M1'; break;
            case NoteType.RWhole: glyph = 'rests.0'; break;
            case NoteType.RHalf: glyph = 'rests.1'; break;
            case NoteType.RQuarter: glyph = 'rests.2'; break;
            case NoteType.R8: glyph = 'rests.3'; break;
            case NoteType.R16: glyph = 'rests.4'; break;
            case NoteType.R32: glyph = 'rests.5'; break;
            case NoteType.R64: glyph = 'rests.6'; break;
            case NoteType.R128: glyph = 'rests.7'; break;
            default: throw 'Illegal rest: ' + note.noteType;
        }
        const staffLine = 
        note.direction === NoteDirection.Down ? 1 :
            note.direction === NoteDirection.Up ? 3 :
                2;
        return [{
            glyph,
            position: { x: xPos, y: staffLine * settings.staffLineWidth }
        } as PhysicalFixedSizeElement];
    }

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

        if (note.dotNo) {
            for (let i = 0; i < note.dotNo; i++) {
                const yAdjustedPos = yPos + ((yPos + settings.staffLineWidth/2) % settings.staffLineWidth);
                //console.log('yAdjustedPos', yAdjustedPos, yPos, (yPos % settings.staffLineWidth));
                
                result.push({
                    position: { x: xPos + settings.dotToNoteDist + settings.dotToDotDist * i, y: yAdjustedPos },
                    glyph: 'dots.dot'
                } as PhysicalFixedSizeElement);    
        
            }
        }    
    
    });


    return result;
}
