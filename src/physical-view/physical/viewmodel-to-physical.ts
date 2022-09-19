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


export function viewModelToPhysical(viewModel: ScoreViewModel, settings: Metrics): PhysicalModel {
    if (viewModel.staves.length) {
        let resultElements: PhysicalElementBase[] = [0, 1, 2, 3, 4].map(n => ({
            element: VertVarSizeGlyphs.Line,
            position: { x: 0, y: settings.staffLineWidth * (4 - n) },
            length: settings.staffLengthOffset + settings.defaultSpacing * viewModel.staves[0].timeSlots.map(slot => slot.objects.length).reduce((prev, curr) => prev + curr, 0)
        }));

        let x = 10 + settings.defaultSpacing;

        viewModel.staves[0].timeSlots.forEach(ts =>  {
            let deltaX = 0;
            ts.objects.forEach(obj => {
                [
                { 
                    if: isClefVM, 
                    then: ((clef: ClefViewModel) => resultElements.push(convertClef(clef, settings)))
                } as VMCondition<ClefViewModel>,

                {
                    if: testKey,
                    then: ((key: KeyViewModel) => {
                        resultElements = resultElements.concat(convertKey(key, x, settings));
                        deltaX += settings.defaultSpacing + key.keyPositions.length * settings.keySigSpacing;
                    })
                } as VMCondition<KeyViewModel>,
                
                { 
                    if: testNote, 
                    then: ((note: NoteViewModel) => { 
                        resultElements = resultElements.concat(convertNote(note, x + deltaX, settings));
                        
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
            x += deltaX + settings.defaultSpacing;

        }
        );
     

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
