import { PhysicalLongElement, PhysicalLongDecoration } from './physical-long-element';
import { PhysicalTupletBracket } from './physical-tuplet-bracket';
import { Time } from './../../model/rationals/time';
import { Cursor } from './cursor';
import { PhysicalBeamGroup } from './physical-beaming';
import { convertMeter } from './physical-meter';
import { TieViewModel, StaffViewModel, FlagType, TimeSlotViewModel, TupletViewModel } from './../../logical-view';
import { convertAccidentals, convertKey } from './physical-key';
import { NoteViewModel } from '../../logical-view';
import { ClefType } from '../../model';
import { Metrics } from './metrics';
import { VertVarSizeGlyphs, GlyphCode, HorizVarSizeGlyphs } from './glyphs';

import { PhysicalModel, PhysicalElementBase, PhysicalFixedSizeElement, PhysicalVertVarSizeElement, PhysicalHorizVarSizeElement, PhysicalBeamElement, PhysicalTupletBracketElement } from './physical-elements';
import { convertNote } from './physical-note';
import { ClefViewModel, ScoreViewModel } from '../../logical-view';
import { scaleDegreeToY } from './functions';
import { generateMeasureMap, MeasureMap, MeasureMapXValueItem } from './measure-map';

/**
 * Physical Model
 * 
 * x origin is at beginning of staff; positive to the right.
 * y origin is at the bottom line of the staff; positive upwards.
 * 
 */


export function viewModelToPhysical(viewModel: ScoreViewModel, settings: Metrics, cursor?: Cursor): PhysicalModel {

    //console.log('viewModelToPhysical', viewModel, settings, cursor);
    
    const measureMap = generateMeasureMap(viewModel, settings);

    const width = measureMap.totalWidth();

    const resultElements = viewModel.staves.map((staffModel: StaffViewModel, idx: number) => {

        const y0 = -settings.staffTopMargin -(settings.staffBottomMargin + settings.staffTopMargin + 8 * settings.scaleDegreeUnit) * idx;

        let staffResultElements: PhysicalElementBase[] = addStaffLines(settings, width);

        const beamings: PhysicalLongElement[] = [];

        staffModel.timeSlots.forEach(ts => {
            staffResultElements = convertStaff(measureMap, ts, beamings, settings, staffResultElements, 
                cursor && cursor.staff === idx ? cursor : undefined);
        });

        //console.log('staffResultElements', staffResultElements);        

        staffResultElements.forEach(re => re.position.y += y0);


        return { 
            elements: staffResultElements            
        };
    });
    if (!resultElements.length) {
        return { elements: [] };
    }
    return resultElements.reduce((prev, curr) => ({ elements: [...prev.elements, ...curr.elements] }), { elements: [] });
}


function addStaffLines(settings: Metrics, width: number): PhysicalElementBase[] {
    return [0, 1, 2, 3, 4].map(n => ({
        element: VertVarSizeGlyphs.Line,
        position: { x: 0, y: settings.scaleDegreeUnit * 2 * (4 - n) },
        length: width
    }));
}

function convertStaff(
    measureMap: MeasureMap, 
    timeSlot: TimeSlotViewModel, 
    longElements: PhysicalLongElement[], 
    settings: Metrics, 
    resultElements: PhysicalElementBase[], 
    cursor?: Cursor
) {
    const mapItem = measureMap.lookup(timeSlot.absTime);
    if (!mapItem)
        throw 'Internal error in measure map';

    convertBeamsIf(timeSlot, longElements, settings);
    convertTupletsIf(timeSlot, longElements, settings);
    convertDecorationsIf(timeSlot, longElements, settings);
    convertClefIf(timeSlot, resultElements, mapItem, settings);
    convertBarIf(timeSlot, resultElements, mapItem, settings);
    resultElements = convertKeyIf(timeSlot, resultElements, mapItem, settings);
    resultElements = convertMeterIf(timeSlot, resultElements, mapItem, settings);
    resultElements = convertAccidentalsIf(timeSlot, resultElements, mapItem, settings);
    resultElements = convertNotesIf(timeSlot, mapItem, settings, resultElements, longElements);
    resultElements = convertTiesIf(timeSlot, resultElements, measureMap, mapItem, settings);

    convertCursorIf(cursor, timeSlot, mapItem, settings, resultElements);
     
    //console.log('longElements', longElements);
    //console.log('resultElements', resultElements);
    
    return resultElements;
}

function convertBeamsIf(timeSlot: TimeSlotViewModel, longElements: PhysicalLongElement[], settings: Metrics) {
    if (timeSlot.beamings) {
        timeSlot.beamings.forEach(beaming => {
            longElements.push(new PhysicalBeamGroup(beaming, settings));
        });
    }
}

function convertCursorIf(cursor: Cursor | undefined, timeSlot: TimeSlotViewModel, mapItem: MeasureMapXValueItem, settings: Metrics, resultElements: PhysicalElementBase[]) {
    let cursorElement: PhysicalHorizVarSizeElement | undefined;

    if (cursor && Time.sortComparison(timeSlot.absTime, cursor.absTime) === 0) {
        cursorElement = { element: HorizVarSizeGlyphs.Cursor, height: 20, position: { x: mapItem.note, y: scaleDegreeToY(cursor.position, settings) } };
        //console.log('cursor', cursor, cursorElement);        
    }

    if (cursorElement)
        resultElements.push(cursorElement);
}

function convertTiesIf(timeSlot: TimeSlotViewModel, resultElements: PhysicalElementBase[], measureMap: MeasureMap, mapItem: MeasureMapXValueItem, settings: Metrics) {
    if (timeSlot.ties) {
        resultElements = resultElements.concat(doConvertTies(timeSlot.ties, measureMap, mapItem, settings));
    }
    return resultElements;
}
function doConvertTies(ties: TieViewModel[], measureMap: MeasureMap, mapItem: MeasureMapXValueItem, settings: Metrics) {
    const tieElements: PhysicalElementBase[] = [];
    ties.forEach((tie: TieViewModel) => {
        let length = 12;
        if (tie.toTime) {
            const checkNextNote = measureMap.lookup(tie.toTime);
            if (checkNextNote && checkNextNote.note)
                length = checkNextNote.note - mapItem.note - settings.tieAfterNote;
        }
        tieElements.push(
            {
                element: VertVarSizeGlyphs.Tie,
                length,
                direction: tie.direction,
                position: { x: mapItem.note as number + settings.tieAfterNote, y: scaleDegreeToY(tie.position, settings) }
            } as PhysicalVertVarSizeElement
        );

    });
    return tieElements;
}
function convertNotesIf(timeSlot: TimeSlotViewModel, mapItem: MeasureMapXValueItem, settings: Metrics, resultElements: PhysicalElementBase[], longElements: PhysicalLongElement[]) {
    timeSlot.notes.forEach((note: NoteViewModel) => {
        const addItems = convertNote(note, mapItem.note, settings);
        resultElements = resultElements.concat(addItems);
        const notestem = addItems.find(elm => elm.element === HorizVarSizeGlyphs.Stem) as PhysicalHorizVarSizeElement;
        /*if (note.flagType === FlagType.Beam && notestem) {
            //console.log('adding beam');
            longElements.forEach(beaming => beaming.addNote({ absTime: timeSlot.absTime, uniq: note.uniq + '' }, notestem, resultElements));
        }
        if (note.tuplet) {*/
        longElements.forEach(longElement => longElement.addNote({ absTime: timeSlot.absTime, uniq: note.uniq + '' }, notestem, resultElements));
        //}
    });
    return resultElements;
}

function convertAccidentalsIf(timeSlot: TimeSlotViewModel, resultElements: PhysicalElementBase[], mapItem: MeasureMapXValueItem, settings: Metrics) {
    if (timeSlot.accidentals) {
        resultElements = resultElements.concat(convertAccidentals(timeSlot.accidentals, mapItem.accidentals as number, settings));

    }
    return resultElements;
}

function convertMeterIf(timeSlot: TimeSlotViewModel, resultElements: PhysicalElementBase[], mapItem: MeasureMapXValueItem, settings: Metrics) {
    if (timeSlot.meter) {
        resultElements = resultElements.concat(convertMeter(timeSlot.meter, mapItem.meter as number, settings));
    }
    return resultElements;
}

function convertKeyIf(timeSlot: TimeSlotViewModel, resultElements: PhysicalElementBase[], mapItem: MeasureMapXValueItem, settings: Metrics) {
    if (timeSlot.key) {
        resultElements = resultElements.concat(convertKey(timeSlot.key, mapItem.key as number, settings));
    }
    return resultElements;
}

function convertBarIf(timeSlot: TimeSlotViewModel, resultElements: PhysicalElementBase[], mapItem: MeasureMapXValueItem, settings: Metrics) {
    if (timeSlot.bar) {
        let element = HorizVarSizeGlyphs.Bar;
        if (timeSlot.bar.repeatEnd) {
            element = timeSlot.bar.repeatStart ? HorizVarSizeGlyphs.RepeatEndStart : HorizVarSizeGlyphs.RepeatEnd;
        } else if (timeSlot.bar.repeatStart) {
            element = HorizVarSizeGlyphs.RepeatStart;
        }
        resultElements.push({
            element,
            position: { x: mapItem.bar as number, y: 0 },
            height: 4 * settings.scaleDegreeUnit * 2
        } as PhysicalHorizVarSizeElement);
    }
}

function convertClefIf(timeSlot: TimeSlotViewModel, resultElements: PhysicalElementBase[], mapItem: MeasureMapXValueItem, settings: Metrics) {
    if (timeSlot.clef) {
        resultElements.push(doConvertClef(timeSlot.clef, mapItem.clef as number, settings));
    }
}

function doConvertClef(clef: ClefViewModel, xPos: number, settings: Metrics): PhysicalElementBase {
    let glyph: GlyphCode;

    switch(clef.clefType) {
        case ClefType.C: glyph = 'clefs.C'; break;
        case ClefType.F: glyph = 'clefs.F'; break;
        case ClefType.G: glyph = 'clefs.G'; break;
        case ClefType.G8: glyph = 'clefs.G'; break;
    }

    if (clef.change) {
        glyph += '_change';
    }

    return {
        position: { x: xPos, y: scaleDegreeToY(clef.line, settings) },
        glyph
    } as PhysicalFixedSizeElement;
}

function convertDecorationsIf(timeSlot: TimeSlotViewModel, longElements: PhysicalLongElement[], settings: Metrics) {
    if (timeSlot.decorations) {
        timeSlot.decorations.forEach(decoration => longElements.push(new PhysicalLongDecoration(decoration, settings)));
    }
}

function convertTupletsIf(timeSlot: TimeSlotViewModel, longElements: PhysicalLongElement[], settings: Metrics) {
    if (timeSlot.tuplets) {
        timeSlot.tuplets.forEach(tuplet => longElements.push(new PhysicalTupletBracket(tuplet, settings)));
    }
}


/*
function convertTupletBracket(tuplet: TupletViewModel, settings: Metrics): PhysicalTupletBracketElement {

    return {
        element: VertVarSizeGlyphs.TupletBracket,
        height: 0,
        length: 0,
        position: {x:0, y:0},
        text: tuplet.tuplets[0].tuplet
    } as PhysicalTupletBracketElement;
}

*/