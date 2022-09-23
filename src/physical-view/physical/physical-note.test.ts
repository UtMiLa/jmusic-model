import { PhysicalHorizVarSizeElement, PhysicalVertVarSizeElement } from './physical-elements';
import { FlagType } from './../../logical-view/view-model/note-view-model';
import { HorizVarSizeGlyphs, VertVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { convertNote } from './physical-note';

describe('Physical model, notes', () => {
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
            length: defaultMetrics.quarterStemDefaultLength
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
            length: -defaultMetrics.quarterStemDefaultLength
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
            length: defaultMetrics.quarterStemDefaultLength
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

    describe('Rests', () => {
        it('should render rests for empty notes', () => {
            //
            const note =                         {
                positions: [],
                noteType: NoteType.RQuarter,
                direction: NoteDirection.Undefined
            };
    
            const physical = convertNote(note, 20, defaultMetrics);
    
            expect(physical.length).to.eq(1);
    
            expect(physical[0]).to.deep.eq({
                glyph: 'rests.2',
                position: { x: 20, y: 2 * defaultMetrics.staffLineWidth }
            });

            const note2 = {
                positions: [],
                noteType: NoteType.R64,
                direction: NoteDirection.Undefined
            };
    
            const physical2 = convertNote(note2, 50, defaultMetrics);
    
            expect(physical2.length).to.eq(1);
    
            expect(physical2[0]).to.deep.eq({
                glyph: 'rests.6',
                position: { x: 50, y: 2 * defaultMetrics.staffLineWidth }
            });

        });
    
        it('should render rests according to direction', () => {
            //
            const note =                         {
                positions: [],
                noteType: NoteType.RQuarter,
                direction: NoteDirection.Up
            };
    
            const physical = convertNote(note, 20, defaultMetrics);
    
            expect(physical.length).to.eq(1);
    
            expect(physical[0]).to.deep.eq({
                glyph: 'rests.2',
                position: { x: 20, y: 3 * defaultMetrics.staffLineWidth }
            });

            const note2 = {
                positions: [],
                noteType: NoteType.R64,
                direction: NoteDirection.Down
            };
    
            const physical2 = convertNote(note2, 50, defaultMetrics);
    
            expect(physical2.length).to.eq(1);
    
            expect(physical2[0]).to.deep.eq({
                glyph: 'rests.6',
                position: { x: 50, y: 1 * defaultMetrics.staffLineWidth }
            });

        });
   
        it('should render dots after rests', () => {
            //
            const note =                         {
                positions: [],
                noteType: NoteType.RQuarter,
                direction: NoteDirection.Up,
                dotNo: 1
            };
    
            const physical = convertNote(note, 20, defaultMetrics);
    
            expect(physical.length).to.eq(2);
    
            expect(physical[1]).to.deep.eq({
                glyph: 'dots.dot',
                position: { x: 20 + defaultMetrics.dotToNoteDist, y: 3.5*defaultMetrics.staffLineWidth }
            });
    
        });
    
    
    
    
    });

    
    it('should render dots', () => {
        //
        const note =                         {
            positions: [3],
            noteType: NoteType.NQuarter,
            flagType: FlagType.F2,
            direction: NoteDirection.Up,
            dotNo: 2
        };

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(5);

        expect(physical[3]).to.deep.eq({
            glyph: 'dots.dot',
            position: { x: 20 + defaultMetrics.dotToNoteDist, y: 3.5*defaultMetrics.staffLineWidth }
        });

        expect(physical[4]).to.deep.eq({
            glyph: 'dots.dot',
            position: { x: 20 + defaultMetrics.dotToNoteDist + defaultMetrics.dotToDotDist, y: 3.5*defaultMetrics.staffLineWidth }
        });


    });

    
    it('should render dots in spaces between lines', () => {
        //
        const note =                         {
            positions: [4],
            noteType: NoteType.NQuarter,
            flagType: FlagType.F2,
            direction: NoteDirection.Up,
            dotNo: 1
        };

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(4);

        expect(physical[3]).to.deep.eq({
            glyph: 'dots.dot',
            position: { x: 20 + defaultMetrics.dotToNoteDist, y: 4.5*defaultMetrics.staffLineWidth }
        });

    });



    it('should render ledger lines for low and high notes', () => {
        //
        const note =                         {
            positions: [-6],
            noteType: NoteType.NWhole,
            direction: NoteDirection.Up
        };

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(2);

        expect(physical[0]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 20 - defaultMetrics.ledgerLineExtra, y: -1*defaultMetrics.staffLineWidth },
            length: 15
        } as PhysicalVertVarSizeElement);


    });


    it('should render ledger lines for low and high notes', () => {
        //
        const note =                         {
            positions: [-10],
            noteType: NoteType.NWhole,
            direction: NoteDirection.Up
        };

        const physical = convertNote(note, 30, defaultMetrics);

        expect(physical.length).to.eq(4);

        expect(physical[0]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: -1*defaultMetrics.staffLineWidth },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[1]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: -2*defaultMetrics.staffLineWidth },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[2]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: -3*defaultMetrics.staffLineWidth },
            length: 15
        } as PhysicalVertVarSizeElement);


    });


    it('should render ledger lines for high notes', () => {
        //
        const note =                         {
            positions: [0, 10],
            noteType: NoteType.NWhole,
            direction: NoteDirection.Up
        };

        const physical = convertNote(note, 30, defaultMetrics);

        expect(physical.length).to.eq(5);

        expect(physical[0]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: 5*defaultMetrics.staffLineWidth },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[1]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: 6*defaultMetrics.staffLineWidth },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[2]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: 7*defaultMetrics.staffLineWidth },
            length: 15
        } as PhysicalVertVarSizeElement);


    });





});