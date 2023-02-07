import { TimeSpan } from './../rationals/time';
import { Time } from '../rationals/time';
import { cloneNote, createNote, createNoteFromLilypond, getNominalDuration, getNoteType, getUndottedDuration, Note, NoteType } from './note';
import { expect } from 'chai';
import { Pitch } from '../pitches/pitch';

describe('Note', () => {

    it('should parse a note from Lilypond format', () => {
        const note = createNoteFromLilypond('c\'4');
        expect(note.pitches.length).to.eq(1);
        expect(note.pitches[0].octave).to.eq(4);
        expect(note.pitches[0].pitchClassName).to.eq('c');
        expect(note.duration).to.deep.eq(Time.newSpan(1, 4));

        const note2 = createNoteFromLilypond('f,2.');
        expect(note2.pitches.length).to.eq(1);
        expect(note2.pitches[0].octave).to.eq(2);
        expect(note2.pitches[0].pitchClassName).to.eq('f');        
        expect(note2.duration).to.deep.eq(Time.newSpan(3, 4));
    });

    it('should parse a rest from Lilypond format', () => {
        const note = createNoteFromLilypond('r4');
        expect(note.pitches.length).to.eq(0);
        expect(getNoteType(note)).to.eq(NoteType.RQuarter);
        expect(note.duration).to.deep.eq(Time.newSpan(1, 4));

        const note2 = createNoteFromLilypond('r2.');
        expect(note2.pitches.length).to.eq(0);
        expect(getNoteType(note2)).to.eq(NoteType.RHalf);
        expect(note2.duration).to.deep.eq(Time.newSpan(3, 4));


        expect(getNoteType(createNoteFromLilypond('r1'))).to.eq(NoteType.RWhole);
        expect(getNoteType(createNoteFromLilypond('r8'))).to.eq(NoteType.R8);
        expect(getNoteType(createNoteFromLilypond('r16'))).to.eq(NoteType.R16);
        expect(getNoteType(createNoteFromLilypond('r32'))).to.eq(NoteType.R32);
        expect(getNoteType(createNoteFromLilypond('r64'))).to.eq(NoteType.R64);
        expect(getNoteType(createNoteFromLilypond('r128'))).to.eq(NoteType.R128);

        const goodRest = createNote([], Time.newSpan(2, 1));
        expect(getNoteType(goodRest)).to.eq(NoteType.RBreve);

        const badRest = createNote([], Time.newSpan(1, 3));
        expect(() => getNoteType(badRest)).to.throw();

    });

    it('should support multiple pitches', () => {
        const note = createNote([
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
        const note = createNoteFromLilypond('<c\' e\' g\'>4');
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
        const notes = ['c\'4.', 'e\'8', 'g\'2..'].map(lily => createNoteFromLilypond(lily));
        expect(notes[0].duration).to.deep.eq(Time.newSpan(3, 8));
        expect(notes[1].duration).to.deep.eq(Time.newSpan(1, 8));
        expect(notes[2].duration).to.deep.eq(Time.newSpan(7, 8));
    });


    it('should report correct number of dots', () => {
        const notes = ['c\'4.', 'e\'8', 'g\'2..'].map(lily => createNoteFromLilypond(lily));
        expect(notes[0].dotNo).to.eq(1);
        expect(notes[1].dotNo).to.eq(0);
        expect(notes[2].dotNo).to.eq(2);
    });


    it('should report undotted value correctly', () => {
        const notes = ['c\'4.', 'e\'8', 'g\'2..'].map(lily => createNoteFromLilypond(lily));
        expect(getUndottedDuration(notes[0])).to.deep.eq(Time.newSpan(1, 4));
        expect(getNoteType(notes[0])).to.deep.eq(NoteType.NQuarter);
        expect(getUndottedDuration(notes[1])).to.deep.eq(Time.newSpan(1, 8));
        expect(getUndottedDuration(notes[2])).to.deep.eq(Time.newSpan(1, 2));

        const goodRest = createNote([], Time.newSpan(2, 1));
        expect(getUndottedDuration(goodRest)).to.deep.eq(Time.newSpan(2, 1));
    });

    
    it('should create a tied note', () => {
        const note = createNoteFromLilypond('c\'4~');
        expect(note.tie).to.be.true;
        const note1 = createNoteFromLilypond('c\'4');
        expect(note1.tie).to.be.undefined;
        const note2 = createNoteFromLilypond('<c\' e\' g\'>4~');
        expect(note2.tie).to.be.true;
    });

    it('should create a tuplet note', () => {
        const note = createNoteFromLilypond('c4');
        expect(note.duration).to.deep.equal(Time.newSpan(1, 4));
        expect(getUndottedDuration(note)).to.deep.equal(Time.newSpan(1, 4));
        expect(getNominalDuration(note)).to.deep.equal(Time.newSpan(1, 4));

        const note1 = cloneNote(note, {tupletFactor: { numerator: 2, denominator: 3 }});
        expect(note1.duration).to.deep.equal(Time.newSpan(1, 6));
        expect(getUndottedDuration(note1)).to.deep.equal(Time.newSpan(1, 4));
        expect(getNominalDuration(note1)).to.deep.equal(Time.newSpan(1, 4));
    });

    it('should create a staccato note', ()=> {
        const note = createNoteFromLilypond('c4\\staccato');
        expect(note.expressions).to.deep.eq(['staccato']);
    });

    it('should fail on non-existent expression', ()=> {
        expect(() => {
            const note = createNoteFromLilypond('c4\\nonexistent');
        }).to.throw();
    });

    it('should create a note with two expressions', ()=> {
        const note = createNoteFromLilypond('c4\\fermata\\marcato');
        expect(note.expressions).to.deep.eq(['fermata', 'marcato']);
    });

});