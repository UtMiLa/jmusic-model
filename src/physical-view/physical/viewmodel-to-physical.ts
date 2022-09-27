import { convertMeter } from '../../physical-view/physical/physical-meter';
import { TimeSlotViewModel, TieViewModel, StaffViewModel } from './../../logical-view/view-model/convert-model';
import { convertKey } from '../../physical-view/physical/physical-key';
import { KeyViewModel } from './../../logical-view/view-model/convert-key';
import { NoteViewModel } from '../../logical-view/view-model/note-view-model';
import { isClefVM } from '../../model/score/staff';
import { Note, NoteType } from '../../model/notes/note';
import { ClefDef, ClefType } from '../../model/states/clef';
import { Metrics } from './metrics';
import { VertVarSizeGlyphs, FixedSizeGlyphs, GlyphCode, HorizVarSizeGlyphs } from './glyphs';

import { PhysicalModel, PhysicalElementBase, PhysicalFixedSizeElement, PhysicalVertVarSizeElement, PhysicalHorizVarSizeElement } from './physical-elements';
import { convertNote, testNote } from './physical-note';
import { ClefViewModel, ScoreViewModel } from '../../logical-view/view-model/convert-model';
import { staffLineToY } from './functions';
import { testKey } from './physical-key';
import { generateMeasureMap, getTimeSlotWidth, mergeMeasureMaps, MeasureMapItem, lookupInMap } from './measure-map';

/**
 * Physical Model
 * 
 * x origin is at beginning of staff; positive to the right.
 * y origin is at the bottom line of the staff; positive upwards.
 * 
 */


function calcSlotLength(timeSlot: TimeSlotViewModel, settings: Metrics): number {
    return settings.defaultSpacing * timeSlot.notes.length + 
        (timeSlot.key ? settings.keySigSpacing * timeSlot.key.keyPositions.length : 0) +
        (timeSlot.clef ? settings.defaultSpacing : 0);
}

function calcLength(timeSlots: TimeSlotViewModel[], settings: Metrics): number {
    return settings.staffLengthOffset + timeSlots.map(slot => calcSlotLength(slot, settings)).reduce((prev, curr) => prev + curr, 0);
}



export function viewModelToPhysical(viewModel: ScoreViewModel, settings: Metrics): PhysicalModel {


    let measureMap: MeasureMapItem[] = [];
    viewModel.staves.forEach(staffModel => {
        const measureMapX = generateMeasureMap(staffModel, settings);
        measureMap = mergeMeasureMaps(measureMap, measureMapX);
    });

    console.log(measureMap);
    

    const resultElements = viewModel.staves.map((staffModel: StaffViewModel, idx: number) => {

        const y0 = -70 * idx;

        let resultElements: PhysicalElementBase[] = [0, 1, 2, 3, 4].map(n => ({
            element: VertVarSizeGlyphs.Line,
            position: { x: 0, y: settings.staffLineWidth * (4 - n) },
            length: calcLength(staffModel.timeSlots, settings)
        }));

        staffModel.timeSlots.forEach(ts =>  {
            const mapItem = lookupInMap(measureMap, ts.absTime);
            if (!mapItem) throw 'Internal error in measure map';
           
            
            if (ts.clef) {
                resultElements.push(convertClef(ts.clef, settings));
            }
            if (ts.bar) {
                resultElements.push({
                    element: HorizVarSizeGlyphs.Bar,
                    position: { x: mapItem.bar as number, y: 0 },
                    length: 4 * settings.staffLineWidth
                } as PhysicalHorizVarSizeElement);
            }
            if (ts.key) {
                resultElements = resultElements.concat(convertKey(ts.key, mapItem.key as number, settings));
            }
            if (ts.meter) {
                resultElements = resultElements.concat(convertMeter(ts.meter, mapItem.meter as number, settings));
            }
            ts.notes.forEach((note: NoteViewModel) => { 
                resultElements = resultElements.concat(convertNote(note, mapItem.note as number, settings));
            
            }); 
            if (ts.ties) {
                ts.ties.forEach((tie: TieViewModel) => { 
                    resultElements.push(
                        {
                            element: VertVarSizeGlyphs.Tie, 
                            length: 12, 
                            direction: tie.direction,
                            position: { x: mapItem.note as number + settings.tieAfterNote, y: staffLineToY(tie.position/2, settings) }
                        } as PhysicalVertVarSizeElement
                    );
                
                }); 
    
            }
        }
        );
     
        resultElements.forEach(re => re.position.y += y0);


        return { 
            elements: resultElements            
        };
    });
    if (!resultElements.length) {
        return { elements: [] };
    }
    return resultElements.reduce((prev, curr) => ({ elements: [...prev.elements, ...curr.elements] }), { elements: [] });
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
