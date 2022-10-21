import { Sequence } from './../../model/score/sequence';
import { HorizVarSizeGlyphs } from './glyphs';
import { Cursor } from './cursor';
import { Pitch } from '../../model/pitches/pitch';
import { Time } from '../../model/rationals/time';
import { expect } from 'chai';
import { ClefType } from '../../model/states/clef';
import { StaffDef } from '../../model/score/staff';
import { createScopedTimeMap, __internal } from '../../logical-view/view-model/convert-model';
import { Metrics, StandardMetrics } from './metrics';
import { StaffViewModel } from '~/logical-view/view-model/score-view-model';
import { viewModelToPhysical } from './viewmodel-to-physical';

describe('Physical model, cursor', () => {
    let defaultMetrics: Metrics;
    let staffViewModel: StaffViewModel;
    //let measureMapMaster: MeasureMap;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();

        const staff = {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialMeter: { count: 4, value: 4 },
            initialKey: { accidental: -1, count: 0},
            voices: [{
                content: new Sequence( 'c\'4 d\'2 e\'4 f\'1')
            }]
        } as StaffDef;

        staffViewModel = __internal.staffModelToViewModel(staff, createScopedTimeMap());

    });


    it('should display a cursor at a given time', () => {
        const cursor: Cursor = {
            absTime: Time.newAbsolute(3, 4),
            position: 0,
            staff: 0
        };

        const phys1 = viewModelToPhysical({ staves: [staffViewModel]}, defaultMetrics);

        expect(phys1.elements).to.have.length(5 + 1 + 2 + 0 + 7 + 1 + 2);
        //console.log(phys1.elements);

        const phys2 = viewModelToPhysical({ staves: [staffViewModel]}, defaultMetrics, cursor);        

        expect(phys2.elements).to.have.length(5 + 1 + 2 + 0 + 7 + 1 + 2 + 1);
        const cursorNotePosition = phys2.elements[14].position;
        //console.log(phys2.elements);
        
        expect(phys2.elements[15]).to.deep.include({
            element: HorizVarSizeGlyphs.Cursor,
            position: { 
                x: cursorNotePosition.x,
                y: 12
            }
        });


    });
});