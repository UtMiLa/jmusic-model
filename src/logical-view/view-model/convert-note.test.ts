import { JMusic } from './../../model/facade/jmusic';
import { Time } from './../../model/rationals/time';
import { TupletSequence } from './../../model/score/transformations';
import { SimpleSequence } from './../../model/score/sequence';
import { Clef, ClefType } from '../../model/states/clef';
import { createNoteFromLilypond, Note, setNoteDirection, setNoteText } from '../../model/notes/note';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { expect } from 'chai';
import { FlagType } from './note-view-model';
import { noteToView } from './convert-note';
import { scoreModelToViewModel, __internal } from './convert-model';
import { voiceSequenceToDef } from '../../model';

describe('View model, note', () => {

    let clef: Clef;

    beforeEach(() => { 
        clef = Clef.clefTreble;
    });

    it('should convert a note to view model', () => {
        const note: Note = createNoteFromLilypond('c\'4');

        const viewModel = noteToView(note, clef);

        expect(viewModel).to.deep.equal({
            positions: [-6],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            flagType: FlagType.None
        });
    });

    it('should direct note stems from position', () => {
        const note1: Note = createNoteFromLilypond('a\'4');
        const note2: Note = createNoteFromLilypond('b\'4');
        const note3: Note = createNoteFromLilypond('c\'\'4');

        const viewModel1 = noteToView(note1, clef);
        const viewModel2 = noteToView(note2, clef);
        const viewModel3 = noteToView(note3, clef);

        expect(viewModel1).to.deep.equal({
            positions: [-1],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            flagType: FlagType.None
        });
        expect(viewModel2).to.deep.equal({
            positions: [0],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            flagType: FlagType.None
        });
        expect(viewModel3).to.deep.equal({
            positions: [1],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Down,
            flagType: FlagType.None
        });
    });

    
    it('should direct fixed note stems correctly', () => {
        const note1_: Note = createNoteFromLilypond('a\'4');
        const note2_: Note = createNoteFromLilypond('b\'4');
        const note3_: Note = createNoteFromLilypond('c\'\'4');

        const note1 = setNoteDirection(note1_, NoteDirection.Up );
        const note2 = setNoteDirection(note2_, NoteDirection.Down );
        const note3 = setNoteDirection(note3_, NoteDirection.Up );

        const viewModel1 = noteToView(note1, clef);
        const viewModel2 = noteToView(note2, clef);
        const viewModel3 = noteToView(note3, clef);

        expect(viewModel1).to.deep.equal({
            positions: [-1],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            flagType: FlagType.None
        });
        expect(viewModel2).to.deep.equal({
            positions: [0],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Down,
            flagType: FlagType.None
        });
        expect(viewModel3).to.deep.equal({
            positions: [1],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            flagType: FlagType.None
        });
    });


    it('should set flagType correctly', () => {
        const note1: Note = createNoteFromLilypond('a\'4');
        const note2: Note = createNoteFromLilypond('b\'8');
        const note3: Note = createNoteFromLilypond('c\'\'16');
        const note4: Note = createNoteFromLilypond('c\'\'32');
        const note5: Note = createNoteFromLilypond('c\'\'64');

        const viewModel1 = noteToView(note1, clef);
        const viewModel2 = noteToView(note2, clef);
        const viewModel3 = noteToView(note3, clef);
        const viewModel4 = noteToView(note4, clef);
        const viewModel5 = noteToView(note5, clef);

        expect(viewModel1.flagType).to.equal(FlagType.None);
        expect(viewModel2.flagType).to.equal(FlagType.F1);
        expect(viewModel3.flagType).to.equal(FlagType.F2);
        expect(viewModel4.flagType).to.equal(FlagType.F3);
        expect(viewModel5.flagType).to.equal(FlagType.F4);
    });



    it('should set flagType correctly on dotted notes', () => {
        const note1: Note = createNoteFromLilypond('a\'4.');
        const note2: Note = createNoteFromLilypond('b\'8.');
        const note3: Note = createNoteFromLilypond('c\'\'16..');
        const note4: Note = createNoteFromLilypond('r32.');
        const note5: Note = createNoteFromLilypond('c\'\'64.');

        const viewModel1 = noteToView(note1, clef);
        const viewModel2 = noteToView(note2, clef);
        const viewModel3 = noteToView(note3, clef);
        const viewModel4 = noteToView(note4, clef);
        const viewModel5 = noteToView(note5, clef);

        expect(viewModel1.flagType).to.equal(FlagType.None);
        expect(viewModel2.flagType).to.equal(FlagType.F1);
        expect(viewModel3.flagType).to.equal(FlagType.F2);
        expect(viewModel4.flagType).to.equal(FlagType.F3);
        expect(viewModel5.flagType).to.equal(FlagType.F4);
    });


    it('should convert a dotted note to view model', () => {
        const note: Note = createNoteFromLilypond('c\'2..');

        const viewModel = noteToView(note, clef);

        expect(viewModel.noteType).to.equal(NoteType.NHalf);
        expect(viewModel.dotNo).to.equal(2);

        const note2: Note = createNoteFromLilypond('c\'2');

        const viewModel2 = noteToView(note2, clef);

        expect(viewModel2.noteType).to.equal(NoteType.NHalf);
        expect(viewModel2.dotNo).to.be.undefined;
    });

    
    it('should convert a dotted, beamed notes to view model', () => {
        const seq = new JMusic('d\'8 c\'16. c\'32 b8. b16 b8 r8 b8.. b32 b16 b8 b16 b16. b32');

        const viewModel = scoreModelToViewModel(seq);

        expect(viewModel.staves[0].timeSlots[1].beamings).to.have.length(1);
        expect((viewModel.staves[0].timeSlots[1].beamings as any)[0].beams).to.deep.eq([
            { fromIdx: 0, toIndex: 2, level: 0 },
            { fromIdx: 1, toIndex: 2, level: 1 },
            { fromIdx: undefined, toIndex: 2, level: 2 },
        ]);
        expect((viewModel.staves[0].timeSlots[4].beamings as any)[0].beams).to.deep.eq([
            { fromIdx: 0, toIndex: 1, level: 0 },
            { fromIdx: undefined, toIndex: 1, level: 1 },
        ]);
        expect((viewModel.staves[0].timeSlots[11].beamings as any)[0].beams).to.deep.eq([
            { fromIdx: 0, toIndex: 2, level: 0 },
            { fromIdx: 0, toIndex: undefined, level: 1 },
            { fromIdx: undefined, toIndex: 2, level: 1 },
        ]);
        //expect(viewModel.dotNo).to.equal(2);
    });
    
    
    it('should create a tuplet group from a tuplet sequence', () => {
        const seq1Text = 'c8 d8 e8';

        const seq1 = SimpleSequence.createFromString(seq1Text);
        const tuplet = new TupletSequence(seq1, { numerator: 2, denominator: 3 });
        const state = new __internal.State([], 0, 0, { content: tuplet }, new Clef({ clefType: ClefType.G, line: -2 }));
        const timeSlots = tuplet.groupByTimeSlots('bb');
        state.voiceTimeSlot = timeSlots[0];

        const elements = __internal.createNoteViewModels(state);
        expect(elements[0]).to.deep.include({
            positions: [-13],
            tuplet: true
        });
        
        /*expect(elements[1]).to.deep.include({
            positions: [-13]
        });*/
        
    });

    
    it('should convert a note with expressions to view model', () => {
        const note: Note = createNoteFromLilypond('c\'2\\staccato');

        const viewModel = noteToView(note, clef);

        expect(viewModel.expressions).to.deep.equal(['staccato']);        
    });
    
    it('should remember note expressions when converting score', () => {
        const score = new JMusic('c\'\'1\\marcato');
        
        const log2 = scoreModelToViewModel(score);
        //console.log(log2.staves[0].timeSlots);
        expect(log2.staves[0].timeSlots[1].notes[0].expressions).to.deep.eq(['marcato']);
    });

    it('should convert a note with lyrics to view model', () => {
        const note0: Note = createNoteFromLilypond('c\'2');
        const note = setNoteText(note0, ['ghjk', 'ery']);

        const viewModel = noteToView(note, clef);

        expect(viewModel.text).to.deep.equal(['ghjk', 'ery']);
    });
    
});