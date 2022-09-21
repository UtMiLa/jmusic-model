import { Time, TimeSpan } from '../rationals/time';
import { Note, NoteType } from './note';
import { expect } from 'chai';
import { Pitch } from '../pitches/pitch';

describe('Note', () => {
    let note1: Note, note2: Note, note3: Note;
    beforeEach(() => {
        note1 = Note.parseLily('c4');
        note2 = Note.parseLily('f,2.');
        note3 = Note.parseLily('gis\'\'4');
    });

    it('should parse a note from Lilypond format', () => {
        const note = Note.parseLily('c\'4');
        expect(note.pitches.length).to.eq(1);
        expect(note.pitches[0].octave).to.eq(4);
        expect(note.pitches[0].pitchClassName).to.eq('c');
        expect(note.duration).to.deep.eq(Time.newSpan(1, 4));

        const note2 = Note.parseLily('f,2.');
        expect(note2.pitches.length).to.eq(1);
        expect(note2.pitches[0].octave).to.eq(2);
        expect(note2.pitches[0].pitchClassName).to.eq('f');        
        expect(note2.duration).to.deep.eq(Time.newSpan(3, 4));
    });

    it('should parse a rest from Lilypond format', () => {
        const note = Note.parseLily('r4');
        expect(note.pitches.length).to.eq(0);
        expect(note.type).to.eq(NoteType.RQuarter);
        expect(note.duration).to.deep.eq(Time.newSpan(1, 4));

        const note2 = Note.parseLily('r2.');
        expect(note2.pitches.length).to.eq(0);
        expect(note2.type).to.eq(NoteType.RHalf);
        expect(note2.duration).to.deep.eq(Time.newSpan(3, 4));
    });

    it('should support multiple pitches', () => {
        const note = new Note([
            Pitch.fromScientific('c', 4),
            Pitch.fromScientific('f', 2)
        ], Time.newSpan(1, 4));
        expect(note.pitches.length).to.eq(2);
        expect(note.pitches[0].octave).to.eq(4);
        expect(note.pitches[0].pitchClassName).to.eq('c');
        expect(note.pitches[1].octave).to.eq(2);
        expect(note.pitches[1].pitchClassName).to.eq('f');
        expect(note.duration).to.deep.eq(Time.newSpan(1, 4));

    });


    it('should parse a chord from Lilypond format', () => {
        const note = Note.parseLily('<c\' e\' g\'>4');
        expect(note.pitches.length).to.eq(3);
        expect(note.pitches[0].octave).to.eq(4);
        expect(note.pitches[0].pitchClassName).to.eq('c');
        expect(note.pitches[1].octave).to.eq(4);
        expect(note.pitches[1].pitchClassName).to.eq('e');
        expect(note.pitches[2].octave).to.eq(4);
        expect(note.pitches[2].pitchClassName).to.eq('g');
        expect(note.duration).to.deep.eq(Time.newSpan(1, 4));

    });

    it('should parse dots correctly', () => {
        const notes = ['c\'4.', 'e\'8', 'g\'2..'].map(lily => Note.parseLily(lily));
        expect(notes[0].duration).to.deep.eq(Time.newSpan(3, 8));
        expect(notes[1].duration).to.deep.eq(Time.newSpan(1, 8));
        expect(notes[2].duration).to.deep.eq(Time.newSpan(7, 8));
    });


    it('should report correct number of dots', () => {
        const notes = ['c\'4.', 'e\'8', 'g\'2..'].map(lily => Note.parseLily(lily));
        expect(notes[0].dotNo).to.eq(1);
        expect(notes[1].dotNo).to.eq(0);
        expect(notes[2].dotNo).to.eq(2);
    });


    it('should report undotted value correctly', () => {
        const notes = ['c\'4.', 'e\'8', 'g\'2..'].map(lily => Note.parseLily(lily));
        expect(notes[0].undottedDuration).to.deep.eq(Time.newSpan(1, 4));
        expect(notes[0].type).to.deep.eq(NoteType.NQuarter);
        expect(notes[1].undottedDuration).to.deep.eq(Time.newSpan(1, 8));
        expect(notes[2].undottedDuration).to.deep.eq(Time.newSpan(1, 2));
    });

});