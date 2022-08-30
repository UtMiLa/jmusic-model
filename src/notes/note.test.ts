import { Time } from './../rationals/time';
import { Note } from './note';
import { expect } from 'chai';
describe('Note', () => {
    let note1: Note, note2: Note, note3: Note;
    beforeEach(() => {
        note1 = Note.parseLily('c4');
        note2 = Note.parseLily('f,2.');
        note3 = Note.parseLily('gis\'\'4');
    });

    it('should parse a note from Lilypond format', () => {
        const note = Note.parseLily('c\'4');
        expect(note.pitch.octave).to.eq(4);
        expect(note.pitch.pitchClass).to.eq('c');
        expect(note.duration).to.deep.eq(Time.newSpan(1, 4));

        const note2 = Note.parseLily('f,2.');
        expect(note2.pitch.octave).to.eq(2);
        expect(note2.pitch.pitchClass).to.eq('f');        
        expect(note2.duration).to.deep.eq(Time.newSpan(3, 4));
    });

});