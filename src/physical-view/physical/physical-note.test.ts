import { PhysicalVertVarSizeElement } from './physical-elements';
import { FlagType, NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { HorizVarSizeGlyphs, VertVarSizeGlyphs } from './glyphs';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model';
import { Metrics, StandardMetrics } from './metrics';
import { expect } from 'chai';
import { convertNote } from './physical-note';

describe('Physical model, notes', () => {
    let defaultMetrics: Metrics;
    let alternativeMetrics: Metrics;

    beforeEach(() => { 
        defaultMetrics = new StandardMetrics();
        alternativeMetrics = new StandardMetrics({            
            scaleDegreeUnit: 3,
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
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.scaleDegreeUnit*2 },
            height: defaultMetrics.quarterStemDefaultLength
        });

        expect(physical[1]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 20 + defaultMetrics.blackNoteHeadRightXOffset, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }
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
            position: { x: 20, y: 3.5*defaultMetrics.scaleDegreeUnit*2 },
            height: -defaultMetrics.quarterStemDefaultLength
        });

        expect(physical[1]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 20, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }
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
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.scaleDegreeUnit*2 },
            height: defaultMetrics.quarterStemDefaultLength
        });

        expect(physical[1]).to.deep.eq({
            glyph: 'flags.u4',
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.scaleDegreeUnit*2 + defaultMetrics.quarterStemDefaultLength }
        });

        expect(physical[2]).to.deep.eq({
            glyph: 'noteheads.s2',
            position: { x: 20, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }
        });

        note.flagType = FlagType.F1;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.u3');
        note.flagType = FlagType.F2;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.u4');
        note.flagType = FlagType.F3;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.u5');
        note.flagType = FlagType.F4;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.u6');
        note.flagType = FlagType.F5;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.u7');

        note.direction = NoteDirection.Down;

        note.flagType = FlagType.F1;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.d3');
        note.flagType = FlagType.F2;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.d4');
        note.flagType = FlagType.F3;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.d5');
        note.flagType = FlagType.F4;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.d6');
        note.flagType = FlagType.F5;
        expect((convertNote(note, 20, defaultMetrics)[1] as any).glyph).to.eq('flags.d7');

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
                position: { x: 20, y: 2 * defaultMetrics.scaleDegreeUnit*2 }
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
                position: { x: 50, y: 2 * defaultMetrics.scaleDegreeUnit*2 }
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
                position: { x: 20, y: 3 * defaultMetrics.scaleDegreeUnit*2 }
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
                position: { x: 50, y: 1 * defaultMetrics.scaleDegreeUnit*2 }
            });

            note2.noteType = NoteType.RBreve;
            expect((convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.eq('rests.M1');

            note2.noteType = NoteType.RWhole;
            expect((convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.eq('rests.0');

            note2.noteType = NoteType.RHalf;
            expect((convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.eq('rests.1');

            note2.noteType = NoteType.R8;
            expect((convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.eq('rests.3');

            note2.noteType = NoteType.R16;
            expect((convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.eq('rests.4');

            note2.noteType = NoteType.R32;
            expect((convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.eq('rests.5');

            note2.noteType = NoteType.R128;
            expect((convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.eq('rests.7');

            note2.noteType = 789 as NoteType;
            expect(() => (convertNote(note2, 50, defaultMetrics)[0] as any).glyph).to.throw('Illegal rest: 789');
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
                position: { x: 20 + defaultMetrics.dotToNoteDist, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }
            });
    
        });
    
    
    
    
    });

    describe('grace notes', () => {

        it('should create a reduced size note with a flag', () => {        
            const note =                         {
                positions: [3],
                noteType: NoteType.NQuarter,
                flagType: FlagType.F2,
                direction: NoteDirection.Up,
                grace: true
            };

            const physical = convertNote(note, 20, defaultMetrics);

            expect(physical.length).to.eq(3);

            expect(physical[0]).to.deep.eq({
                element: HorizVarSizeGlyphs.Stem,
                position: { x: 20 + defaultMetrics.graceScale * defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.scaleDegreeUnit*2 },
                height: defaultMetrics.quarterStemDefaultLength * defaultMetrics.graceScale
            });

            expect(physical[1]).to.deep.eq({
                glyph: 'flags.u4',
                scale: defaultMetrics.graceScale,
                position: { x: 20 + defaultMetrics.graceScale * defaultMetrics.blackNoteHeadLeftXOffset, y: 3.5*defaultMetrics.scaleDegreeUnit*2 + defaultMetrics.quarterStemDefaultLength * defaultMetrics.graceScale }
            });

            expect(physical[2]).to.deep.eq({
                glyph: 'noteheads.s2',
                scale: defaultMetrics.graceScale,
                position: { x: 20, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }
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
            position: { x: 20 + defaultMetrics.dotToNoteDist, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }
        });

        expect(physical[4]).to.deep.eq({
            glyph: 'dots.dot',
            position: { x: 20 + defaultMetrics.dotToNoteDist + defaultMetrics.dotToDotDist, y: 3.5*defaultMetrics.scaleDegreeUnit*2 }
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
            position: { x: 20 + defaultMetrics.dotToNoteDist, y: 4.5*defaultMetrics.scaleDegreeUnit*2 }
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
            position: { x: 20 - defaultMetrics.ledgerLineExtra, y: -1*defaultMetrics.scaleDegreeUnit*2 },
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
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: -1*defaultMetrics.scaleDegreeUnit*2 },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[1]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: -2*defaultMetrics.scaleDegreeUnit*2 },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[2]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: -3*defaultMetrics.scaleDegreeUnit*2 },
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
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: 5*defaultMetrics.scaleDegreeUnit*2 },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[1]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: 6*defaultMetrics.scaleDegreeUnit*2 },
            length: 15
        } as PhysicalVertVarSizeElement);

        expect(physical[2]).to.deep.eq({
            //glyph: 'dots.dot',
            element: VertVarSizeGlyphs.LedgerLine,
            position: { x: 30 - defaultMetrics.ledgerLineExtra, y: 7*defaultMetrics.scaleDegreeUnit*2 },
            length: 15
        } as PhysicalVertVarSizeElement);


    });




    it('should displace notes in dense chords', () => {
        //
        const note =                         {
            positions: [3, 4, 5],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up
        };

        const physical = convertNote(note, 30, defaultMetrics);

        expect(physical.length).to.eq(4);

        expect(physical[1].position.x).to.eq(30);
        expect(physical[2].position.x).to.eq(30 + defaultMetrics.blackNoteHeadLeftXOffset);
        expect(physical[3].position.x).to.eq(30);


    });


    it('should displace notes in semi-dense chords', () => {
        //
        const note =                         {
            positions: [-4, -2, -1, 0],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up
        };

        const physical = convertNote(note, 30, defaultMetrics);

        expect(physical.length).to.eq(5);

        expect(physical[1].position.x).to.eq(30);
        expect(physical[2].position.x).to.eq(30);
        expect(physical[3].position.x).to.eq(30 + defaultMetrics.blackNoteHeadLeftXOffset);
        expect(physical[4].position.x).to.eq(30);


    });

    
    it('should create note expressions', () => {
        //
        const note = {
            positions: [3],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            expressions: ['staccato']
        } as NoteViewModel;

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(3);

        expect(physical[2]).to.deep.eq({
            glyph: 'scripts.staccato',
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset/2, y: 5 * defaultMetrics.scaleDegreeUnit - 5 }
        });

    });


    it('should create note expressions with up/down versions', () => {
        //
        const note = {
            positions: [3],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            expressions: ['staccatissimo', 'fermata']
        } as NoteViewModel;

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(4);

        expect(physical[2]).to.deep.eq({
            glyph: 'scripts.dstaccatissimo',
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset/2, y: 5 * defaultMetrics.scaleDegreeUnit - 5}
        });

        expect(physical[3]).to.deep.eq({
            glyph: 'scripts.dfermata',
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset/2, y: 5 * defaultMetrics.scaleDegreeUnit - 10 }
        });

        note.direction = NoteDirection.Down;

        const physical1 = convertNote(note, 20, defaultMetrics);

        expect(physical1.length).to.eq(4);

        expect(physical1[2]).to.deep.eq({
            glyph: 'scripts.ustaccatissimo',
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset/2, y: 9 * defaultMetrics.scaleDegreeUnit + 5}
        });

        expect(physical1[3]).to.deep.eq({
            glyph: 'scripts.ufermata',
            position: { x: 20 + defaultMetrics.blackNoteHeadLeftXOffset/2, y: 9 * defaultMetrics.scaleDegreeUnit + 10 }
        });

    });



  
    it('should create lyrics', () => {
        //
        const note = {
            positions: [3],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            text: ['Syll', 'ab-', '-']
        } as NoteViewModel;

        const physical = convertNote(note, 20, defaultMetrics);

        expect(physical.length).to.eq(5);

        expect(physical[2]).to.deep.include({
            text: 'Syll',
            position: { x: 20, y: -defaultMetrics.lyricsVerse1Y }
        });

        expect(physical[3]).to.deep.include({
            text: 'ab-',
            position: { x: 20, y: -defaultMetrics.lyricsVerse1Y - defaultMetrics.lyricsVerseSpacing }
        });

        expect(physical[4]).to.deep.include({
            text: '-',
            position: { x: 20, y: -defaultMetrics.lyricsVerse1Y - 2 * defaultMetrics.lyricsVerseSpacing }
        });

    });



});