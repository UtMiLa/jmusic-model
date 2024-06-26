import { FlagType, NoteViewModel } from '../../logical-view';
import { Note, NoteDirection, NoteType } from '../../model';
import { GlyphCode, HorizVarSizeGlyphs, OtherVarSizeGlyphs, VertVarSizeGlyphs } from './glyphs';
import { Metrics } from './metrics';
import { PhysicalElementBase, PhysicalHorizVarSizeElement, PhysicalFixedSizeElement, PhysicalVertVarSizeElement, PhysicalTextElement } from './physical-elements';
import { calcDisplacements, scaleDegreeToY } from './functions';
import { getGlyphForNoteExpression } from '../../model/notes/note-expressions';
import { mathMod } from 'ramda';


/*export function testNote(viewModel: any): NoteViewModel | undefined {
    return viewModel.noteType ? viewModel as NoteViewModel : undefined;
}*/


export function convertNote(note: NoteViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    if (!note.positions.length) {
        // rest
        return convertRest(note, xPos, settings);
    }

    let result: PhysicalElementBase[] = [];
    const directionUp = note.direction === NoteDirection.Up;

    note.positions.sort((a, b) => a - b);
    //const yPositions = note.positions.map(pos => staffLineToY(pos / 2, settings));
    const yPositions = note.positions.map(pos => scaleDegreeToY(pos, settings));
    //if (note.positions.length > 1) console.log('note.positions', note.positions, yPositions);
    
    const scale = note.grace ? settings.graceScale : 1.0;
    const chordLength = yPositions[yPositions.length - 1] - yPositions[0];
    const stemBaseY = directionUp ? yPositions[0] : yPositions[yPositions.length - 1];
    const stemBaseX = directionUp ? xPos + scale*settings.blackNoteHeadLeftXOffset : xPos + scale*settings.blackNoteHeadRightXOffset;
    const stemBaseXhalf = directionUp ? xPos + scale*settings.halfNoteHeadLeftXOffset : xPos + scale*settings.halfNoteHeadRightXOffset;
    const stemSign = directionUp ? 1 : -1;

    
    for (let i = -6; i >= note.positions[0]; i -= 2) {
        result.push({
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: xPos - settings.ledgerLineExtra, y: (i/2 + 2) * settings.scaleDegreeUnit*2 },
            length: settings.ledgerLineLength
        } as PhysicalVertVarSizeElement);
    }

    for (let i = 6; i <= note.positions[note.positions.length - 1]; i += 2) {
        result.push({
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: xPos - settings.ledgerLineExtra, y: (i/2 + 2) * settings.scaleDegreeUnit*2 },
            length: settings.ledgerLineLength
        } as PhysicalVertVarSizeElement);
    }


    const glyph = getNoteheadGlyph(note.noteType);

    const stemAndFlag = getStemAndFlag(note.noteType, note.flagType, settings, stemSign, chordLength, stemBaseX, stemBaseXhalf, stemBaseY, directionUp, scale);
    result = result.concat(stemAndFlag);

    const displacements = calcDisplacements(note);

    // if (displacements.length > 1) console.log('displacements', displacements, yPositions, note);
    
    yPositions.forEach((yPos, idx) => {
        const displacement = displacements[idx] * settings.blackNoteHeadLeftXOffset;
        const elm = {
            position: { x: xPos + displacement, y: yPos },
            glyph            
        } as PhysicalFixedSizeElement;
        if (note.colors) {
            elm.color = note.colors[idx];
        }
        if (note.grace) {
            elm.scale = settings.graceScale;
        }
        result.push(elm);    

        
        addDots(note, yPos, settings, result, xPos);          
    
    });

    if (note.expressions) {
        addExpressions(note, xPos + settings.blackNoteHeadLeftXOffset/2, stemBaseY, directionUp, result, settings);
        // todo: calculate center xPos based on notehead (use it for expression and cursor placement)
        //console.log('added expressions', note, result);        
    }

    if (note.text) {
        addText(note, xPos, stemBaseY, directionUp, result, settings);
        //console.log('added expressions', note, result);        
    }

    if (note.selected) {
        result = [{
            element: OtherVarSizeGlyphs.Selection,
            position: { x: xPos - 5, y: stemBaseY - 10 },
            length: 20,
            height: 20
        } as PhysicalElementBase, ...result];
    }

    return result;
}

function getFlagGlyph(flagType: FlagType, directionUp: boolean) {
    let glyph: GlyphCode;
    switch (flagType) {
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
        default:
            throw 'Invalid flagtype: ' + flagType;
    }
    return glyph;
}

function convertRest(note: NoteViewModel, xPos: number, settings: Metrics) {
    let glyph: GlyphCode;
    switch (note.noteType) {
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
    const staffLine = note.direction === NoteDirection.Down ? 1 :
        note.direction === NoteDirection.Up ? 3 :
            2;

    const res = [{
        glyph,
        position: { x: xPos, y: staffLine * settings.scaleDegreeUnit*2 }
    } as PhysicalFixedSizeElement];

    addDots(note, staffLine * settings.scaleDegreeUnit*2, settings, res, xPos);

    
    if (note.selected) {
        return [{
            element: OtherVarSizeGlyphs.Selection,
            position: { x: xPos - 5, y: staffLine * settings.scaleDegreeUnit*2 - 10 },
            length: 20,
            height: 20
        } as PhysicalElementBase, ...res];
    }


    return res;
}

function addDots(note: NoteViewModel, yPos: number, settings: Metrics, result: PhysicalElementBase[], xPos: number) {
    if (note.dotNo) {
        for (let i = 0; i < note.dotNo; i++) {
            const yAdjustedPos = yPos + mathMod((yPos + settings.scaleDegreeUnit), (settings.scaleDegreeUnit*2));
            //console.log('yAdjustedPos', yAdjustedPos, yPos, (yPos % settings.scaleDegreeUnit*2));
            result.push({
                position: { x: xPos + settings.dotToNoteDist + settings.dotToDotDist * i, y: yAdjustedPos },
                glyph: 'dots.dot'
            } as PhysicalFixedSizeElement);

        }
    }
}

function getNoteheadGlyph(noteType: NoteType): GlyphCode {
    switch(noteType) {
        case NoteType.NBreve: 
            return 'noteheads.sM1'; 
            
        case NoteType.NWhole: 
            return 'noteheads.s0'; 
            
        case NoteType.NHalf: 
            return 'noteheads.s1';

        case NoteType.NQuarter: 
            return 'noteheads.s2'; 

        default: throw 'Illegal noteType: ' + noteType;
        
    }

}

function getStemAndFlag(noteType: NoteType, flagType: FlagType | undefined, settings: Metrics,
    stemSign: number, chordLength: number, stemBaseX: number, stemBaseXhalf: number, stemBaseY: number, 
    directionUp: boolean, scale: number): PhysicalElementBase[] {
    //
    //const scale = grace ? settings.graceScale : 1.0;
    switch(noteType) {
        case NoteType.NBreve: 
            //glyph = 'noteheads.sM1'; 
            return [];
        case NoteType.NWhole: 
            //glyph = 'noteheads.s0'; 
            return [];
        case NoteType.NHalf: 
            //glyph = 'noteheads.s1';

            return [{
                element: HorizVarSizeGlyphs.Stem,
                height: stemSign * (settings.quarterStemDefaultLength*scale + chordLength),
                position: { x: stemBaseXhalf, y: stemBaseY }
            } as PhysicalHorizVarSizeElement];
            
        case NoteType.NQuarter: 
        //glyph = 'noteheads.s2'; 
        {
            const result: PhysicalElementBase[] = [{
                element: HorizVarSizeGlyphs.Stem,
                height: stemSign * (settings.quarterStemDefaultLength*scale + chordLength),
                position: { x: stemBaseX, y: stemBaseY }
            } as PhysicalHorizVarSizeElement];

            if (flagType && flagType !== FlagType.Beam) {
                const glyph: GlyphCode = getFlagGlyph(flagType, directionUp);
                const elem = {
                    position: { x: stemBaseX, y: stemBaseY + stemSign * (scale * settings.quarterStemDefaultLength + chordLength) },
                    glyph
                } as PhysicalFixedSizeElement;

                if (scale !== 1.0) {
                    elem.scale = scale;
                }
                result.push(elem);    
            }

            return result;
        }

        default: 
            throw 'Illegal notetype: ' + noteType;

    }


}

function addExpressions(note: NoteViewModel, xPos: number, stemBaseY: number, directionUp: boolean, result: PhysicalElementBase[], settings: Metrics) {
    note.expressions?.forEach((expression, index) => {
        const yOffset = (directionUp ? -1 : 1) * (settings.scaleDegreeUnit*2 + settings.noteExpressionOffset + settings.noteExpressionSpacing * index);
        result.push({
            glyph: getGlyphForNoteExpression(expression, directionUp),
            position: {x: xPos, y: stemBaseY + yOffset }
        } as PhysicalFixedSizeElement);
    });
    
}

function addText(note: NoteViewModel, xPos: number, stemBaseY: number, directionUp: boolean, result: PhysicalElementBase[], settings: Metrics) {
    note.text?.forEach((syllable, index) => {
        const yOffset = -settings.lyricsVerse1Y - settings.lyricsVerseSpacing * index;
        result.push({
            text: syllable,
            font: settings.lyricsFont,
            fontSize: settings.lyricsFontSize,
            position: {x: xPos, y: yOffset }
        } as PhysicalTextElement);
    });
    
}

