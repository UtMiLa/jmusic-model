import { Clef } from '../../model/states/clef';
import { Note } from '../../model/notes/note';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { ClefType } from '~/model/states/clef';
import { expect } from 'chai';
import { noteToView, FlagType } from './note-view-model';

describe('View model, note', () => {

    let clef: Clef;

    beforeEach(() => { 
        clef = Clef.clefTreble;
    });

    it('should convert a note to view model', () => {
        const note: Note = Note.parseLily('c\'4');

        const viewModel = noteToView(note, clef);

        expect(viewModel).to.deep.equal({
            positions: [-6],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up,
            flagType: FlagType.None
        });
    });

    it('should direct note stems from position', () => {
        const note1: Note = Note.parseLily('a\'4');
        const note2: Note = Note.parseLily('b\'4');
        const note3: Note = Note.parseLily('c\'\'4');

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
        const note1: Note = Note.parseLily('a\'4');
        const note2: Note = Note.parseLily('b\'4');
        const note3: Note = Note.parseLily('c\'\'4');

        note1.direction = NoteDirection.Up;
        note2.direction = NoteDirection.Down;
        note3.direction = NoteDirection.Up;

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
        const note1: Note = Note.parseLily('a\'4');
        const note2: Note = Note.parseLily('b\'8');
        const note3: Note = Note.parseLily('c\'\'16');
        const note4: Note = Note.parseLily('c\'\'32');
        const note5: Note = Note.parseLily('c\'\'64');

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
        const note1: Note = Note.parseLily('a\'4.');
        const note2: Note = Note.parseLily('b\'8.');
        const note3: Note = Note.parseLily('c\'\'16..');
        const note4: Note = Note.parseLily('r32.');
        const note5: Note = Note.parseLily('c\'\'64.');

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
        const note: Note = Note.parseLily('c\'2..');

        const viewModel = noteToView(note, clef);

        expect(viewModel.noteType).to.equal(NoteType.NHalf);
        expect(viewModel.dotNo).to.equal(2);

        const note2: Note = Note.parseLily('c\'2');

        const viewModel2 = noteToView(note2, clef);

        expect(viewModel2.noteType).to.equal(NoteType.NHalf);
        expect(viewModel2.dotNo).to.be.undefined;


    });
});