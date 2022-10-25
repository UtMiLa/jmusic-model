import { PhysicalLongElement } from './physical-long-element';
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
import { staffLineToY } from './functions';
import { MeasureMap, MeasureMapXValueItem } from './measure-map';

/**
 * Physical Model
 * 
 * x origin is at beginning of staff; positive to the right.
 * y origin is at the bottom line of the staff; positive upwards.
 * 
 */


/*function calcSlotLength(timeSlot: TimeSlotViewModel, settings: Metrics): number {
    return settings.defaultSpacing * timeSlot.notes.length + 
        (timeSlot.key ? settings.keySigSpacing * timeSlot.key.keyPositions.length : 0) +
        (timeSlot.clef ? settings.defaultSpacing : 0);
}*/

/*function calcLength(timeSlots: TimeSlotViewModel[], settings: Metrics): number {
    return settings.staffLengthOffset + timeSlots.map(slot => calcSlotLength(slot, settings)).reduce((prev, curr) => prev + curr, 0);
}*/



export function viewModelToPhysical(viewModel: ScoreViewModel, settings: Metrics, cursor?: Cursor): PhysicalModel {

    let measureMap = new MeasureMap();
    viewModel.staves.forEach(staffModel => {
        const measureMapX = MeasureMap.generate(staffModel, settings);
        measureMap = measureMap.mergeWith(measureMapX);
    });

    const width = measureMap.totalWidth();

    const resultElements = viewModel.staves.map((staffModel: StaffViewModel, idx: number) => {

        const y0 = -70 * idx;

        let staffResultElements: PhysicalElementBase[] = addStaffLines(settings, width);

        const beamings: PhysicalLongElement[] = [];

        staffModel.timeSlots.forEach(ts => {
            staffResultElements = convertStaff(measureMap, ts, beamings, settings, staffResultElements, cursor);
        });

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
    beamings: PhysicalLongElement[], 
    settings: Metrics, 
    resultElements: PhysicalElementBase[], 
    cursor?: Cursor
) {
    const mapItem = measureMap.lookup(timeSlot.absTime);
    if (!mapItem)
        throw 'Internal error in measure map';

    if (timeSlot.beamings) {
        timeSlot.beamings.forEach(beaming => {
            beamings.push(new PhysicalBeamGroup(beaming, settings));
        });
    }

    if (timeSlot.tuplet) {
        beamings.push(new PhysicalTupletBracket(timeSlot.tuplet, settings));
    }

    if (timeSlot.clef) {
        resultElements.push(convertClef(timeSlot.clef, mapItem.clef as number, settings));
    }
    if (timeSlot.bar) {
        resultElements.push({
            element: HorizVarSizeGlyphs.Bar,
            position: { x: mapItem.bar as number, y: 0 },
            height: 4 * settings.scaleDegreeUnit * 2
        } as PhysicalHorizVarSizeElement);
    }
    if (timeSlot.key) {
        resultElements = resultElements.concat(convertKey(timeSlot.key, mapItem.key as number, settings));
    }
    if (timeSlot.meter) {
        resultElements = resultElements.concat(convertMeter(timeSlot.meter, mapItem.meter as number, settings));
    }
    if (timeSlot.accidentals) {
        resultElements = resultElements.concat(convertAccidentals(timeSlot.accidentals, mapItem.accidentals as number, settings));

    }
    timeSlot.notes.forEach((note: NoteViewModel) => {
        const addItems = convertNote(note, mapItem.note, settings);
        resultElements = resultElements.concat(addItems);
        const notestem = addItems.find(elm => elm.element === HorizVarSizeGlyphs.Stem) as PhysicalHorizVarSizeElement;
        if (note.flagType === FlagType.Beam && notestem) {
            //console.log('adding beam');
            beamings.forEach(beaming => beaming.addNote({ absTime: timeSlot.absTime, uniq: note.uniq + '' }, notestem, resultElements));
        }
        if (note.tuplet) {
            beamings.forEach(beaming => beaming.addNote({ absTime: timeSlot.absTime, uniq: note.uniq + '' }, notestem, resultElements));
        }
    });
    if (timeSlot.ties) {
        resultElements = resultElements.concat(convertTies(timeSlot.ties, measureMap, mapItem, settings));
    }

    let cursorElement: PhysicalHorizVarSizeElement | undefined;

    if (cursor && Time.sortComparison(timeSlot.absTime, cursor.absTime) === 0) {
        cursorElement = { element: HorizVarSizeGlyphs.Cursor, height: 20, position: { x: mapItem.note, y: staffLineToY(cursor.position / 2, settings) } };
        //console.log('cursor', cursor, cursorElement);        
    }

    if (cursorElement) resultElements.push(cursorElement);
     
    return resultElements;
}

function convertTies(ties: TieViewModel[], measureMap: MeasureMap, mapItem: MeasureMapXValueItem, settings: Metrics) {
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
                position: { x: mapItem.note as number + settings.tieAfterNote, y: staffLineToY(tie.position / 2, settings) }
            } as PhysicalVertVarSizeElement
        );

    });
    return tieElements;
}

function convertClef(clef: ClefViewModel, xPos: number, settings: Metrics): PhysicalElementBase {
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
        position: { x: xPos, y: staffLineToY(clef.line/2, settings) },
        glyph
    } as PhysicalFixedSizeElement;
}

function convertTupletBracket(tuplet: TupletViewModel, settings: Metrics): PhysicalTupletBracketElement {

    return {
        element: VertVarSizeGlyphs.TupletBracket,
        height: 0,
        length: 0,
        position: {x:0, y:0},
        text: tuplet.tuplets[0].tuplet
    };
}

