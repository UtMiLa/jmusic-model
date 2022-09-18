import { Clef } from './../../model/states/clef';
import { Note } from './../../model/notes/note';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { ClefType } from '~/model/states/clef';
import { expect } from 'chai';
import { noteToView } from './note-view-model';

describe('Physical model', () => {

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
            direction: NoteDirection.Up
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
            direction: NoteDirection.Up
        });
        expect(viewModel2).to.deep.equal({
            positions: [0],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up
        });
        expect(viewModel3).to.deep.equal({
            positions: [1],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Down
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
            direction: NoteDirection.Up
        });
        expect(viewModel2).to.deep.equal({
            positions: [0],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Down
        });
        expect(viewModel3).to.deep.equal({
            positions: [1],
            noteType: NoteType.NQuarter,
            direction: NoteDirection.Up
        });
    });

});