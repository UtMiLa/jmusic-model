import { FlagType } from './../../logical-view/view-model/note-view-model';
import { HorizVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { convertNote } from './physical-note';

describe('Physical model', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            staffLineWidth: 6,
            staffLengthOffset: 8,
        });
    });


    it('should attach stem on note on up direction', () => {
        //
        const note =                         {
            positions: [3],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up
        };

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(2);

        expect(physical[0]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.staffLineWidth },
            length: 25
        });

        expect(physical[1]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 20 + defaultMetrics.blackNoteHeadRightXOffset, y: 3.5*defaultMetrics.staffLineWidth }
        });

    });

    it('should attach stem on note on down direction', () => {
        //
        const note =                         {
            positions: [3],
            noteType: NoteType.NQuarter,
            flagType: FlagType.None,
            direction: NoteDirection.Down
        };

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(2);

        expect(physical[0]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            position: { x: 20, y: 3.5*defaultMetrics.staffLineWidth },
            length: -25
        });

        expect(physical[1]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 20, y: 3.5*defaultMetrics.staffLineWidth }
        });

    });

    it('should attach flags on note on up direction', () => {
        //
        const note =                         {
            positions: [3],
            noteType: NoteType.NQuarter,
            flagType: FlagType.F2,
            direction: NoteDirection.Up
        };

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(3);

        expect(physical[0]).to.deep.eq({
            element: HorizVarSizeGlyphs.Stem,
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.staffLineWidth },
            length: 25
        });

        expect(physical[1]).to.deep.eq({
            glyph: 'flags.u4',
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.staffLineWidth + defaultMetrics.quarterStemDefaultLength }
        });

        expect(physical[2]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 20, y: 3.5*defaultMetrics.staffLineWidth }
        });

    });



});