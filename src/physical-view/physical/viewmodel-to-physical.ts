import { PhysicalBeamGroup } from './physical-beaming';
import { BeamingViewModel } from './../../logical-view/view-model/beaming-view-model';
import { AccidentalViewModel } from './../../logical-view/view-model/convert-model';
import { convertMeter } from './physical-meter';
import { TimeSlotViewModel, TieViewModel, StaffViewModel, FlagType } from './../../logical-view';
import { convertAccidentals, convertKey } from './physical-key';
import { NoteViewModel } from '../../logical-view';
import { ClefType, getAllBars } from '../../model';
import { Metrics } from './metrics';
import { VertVarSizeGlyphs, GlyphCode, HorizVarSizeGlyphs } from './glyphs';

import { PhysicalModel, PhysicalElementBase, PhysicalFixedSizeElement, PhysicalVertVarSizeElement, PhysicalHorizVarSizeElement } from './physical-elements';
import { convertNote } from './physical-note';
import { ClefViewModel, ScoreViewModel } from '../../logical-view';
import { staffLineToY } from './functions';
import { MeasureMapItem, MeasureMap } from './measure-map';

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

    let measureMap = new MeasureMap();
    viewModel.staves.forEach(staffModel => {
        const measureMapX = MeasureMap.generate(staffModel, settings);
        measureMap = measureMap.mergeWith(measureMapX);
    });

    let width = 0;
    measureMap.measureMap.forEach(mm => width += mm.width);

    const resultElements = viewModel.staves.map((staffModel: StaffViewModel, idx: number) => {

        const y0 = -70 * idx;

        let resultElements: PhysicalElementBase[] = [0, 1, 2, 3, 4].map(n => ({
            element: VertVarSizeGlyphs.Line,
            position: { x: 0, y: settings.scaleDegreeUnit*2 * (4 - n) },
            length: width //calcLength(staffModel.timeSlots, settings)
        }));

        const beamings: PhysicalBeamGroup[] = [];

        staffModel.timeSlots.forEach(ts =>  {
            const mapItem = measureMap.lookup(ts.absTime);
            if (!mapItem) throw 'Internal error in measure map';
           
            if (ts.beamings) {
                ts.beamings.forEach(beaming => {
                    beamings.push(new PhysicalBeamGroup(beaming, settings));
                });
            }
            
            if (ts.clef) {
                resultElements.push(convertClef(ts.clef,  mapItem.clef as number, settings));
            }
            if (ts.bar) {
                resultElements.push({
                    element: HorizVarSizeGlyphs.Bar,
                    position: { x: mapItem.bar as number, y: 0 },
                    height: 4 * settings.scaleDegreeUnit*2
                } as PhysicalHorizVarSizeElement);
            }
            if (ts.key) {
                resultElements = resultElements.concat(convertKey(ts.key, mapItem.key as number, settings));
            }
            if (ts.meter) {
                resultElements = resultElements.concat(convertMeter(ts.meter, mapItem.meter as number, settings));
            }
            if (ts.accidentals) {
                resultElements = resultElements.concat(convertAccidentals(ts.accidentals, mapItem.accidentals as number, settings));
                
            }
            ts.notes.forEach((note: NoteViewModel) => { 
                const addItems = convertNote(note, mapItem.note as number, settings);
                resultElements = resultElements.concat(addItems);
                const notestem = addItems.find(elm => elm.element === HorizVarSizeGlyphs.Stem) as PhysicalHorizVarSizeElement;
                if (note.flagType === FlagType.Beam && notestem) {
                    //console.log('adding beam');
                    
                    beamings.forEach(beaming => beaming.addNote({absTime: ts.absTime, uniq: note.uniq + '' }, notestem, resultElements));
                }
            }); 
            if (ts.ties) {
                ts.ties.forEach((tie: TieViewModel) => { 
                    let length = 12;
                    if (tie.toTime) {
                        const checkNextNote = measureMap.lookup(tie.toTime);
                        if (checkNextNote && checkNextNote.note) length = checkNextNote.note - mapItem.note - settings.tieAfterNote;
                    }
                    resultElements.push(
                        {
                            element: VertVarSizeGlyphs.Tie, 
                            length,
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

function convertClef(clef: ClefViewModel, xPos: number, settings: Metrics): PhysicalElementBase {
    let glyph: GlyphCode;

    switch(clef.clefType) {
        case ClefType.C: glyph = 'clefs.C'; break;
        case ClefType.F: glyph = 'clefs.F'; break;
        case ClefType.G: glyph = 'clefs.G'; break;
        case ClefType.G8: glyph = 'clefs.G'; break;
    }

    return {
        position: { x: xPos, y: staffLineToY(clef.line/2, settings) },
        glyph
    } as PhysicalFixedSizeElement;
}
