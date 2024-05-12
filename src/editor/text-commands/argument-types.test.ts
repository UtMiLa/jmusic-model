import { StateChange } from './../../model/states/state';
import { Clef, ClefType, Key, MeterFactory, Pitch, PitchClass, Time, cloneNote, createNote, createNoteFromLilypond } from 'model';
import { expect } from 'chai';
import { ClefArg, KeyArg, MeterArg, NoteArg, SpacerArg,  PitchClassArg, PitchArg, SplitSequenceArg } from './argument-types';
import { createSpacerFromLilypond } from '../../model/notes/spacer';
import { either } from 'fp-ts';

describe('Argument types', () => {
        
    describe('Pitch class', () => {
        it('should parse a pitch class token', () => {
            expect(PitchClassArg('eeses,,')).to.deep.eq(either.right([new PitchClass(2, -2), ',,']));
        });
        it('should fail on an illegal pitch class', () => {
            expect(PitchClassArg('jes,,')).to.deep.eq(either.left('Illegal pitch class: jes,,'));
        });
    });
    
    describe('Pitch', () => {
        it('should parse a pitch token', () => {
            expect(PitchArg('eeses,,4')).to.deep.eq(either.right([new Pitch(2, 1, -2), '4']));
        });
        it('should fail on an illegal pitch', () => {
            expect(PitchArg('jes,,')).to.deep.eq(either.left('Illegal pitch class: jes,,'));
        });
    });
    
    describe('Note', () => {
        it('should parse a note token', () => {
            expect(NoteArg('eeses\'\'4')).to.deep.eq(either.right([createNote([new Pitch(2, 5, -2)], Time.newSpan(1, 4), false), '']));
        });
        it('should parse a note token with dots', () => {
            expect(NoteArg('e4.')).to.deep.eq(either.right([createNote([new Pitch(2, 3)], Time.newSpan(3, 8), false), '']));
        });
        it('should parse a note token with tie', () => {
            expect(NoteArg('e4~')).to.deep.eq(either.right([createNote([new Pitch(2, 3)], Time.newSpan(1, 4), true), '']));
        });
        it('should parse a note token with expressions', () => {
            expect(NoteArg('e4\\staccato\\fermata')).to.deep.eq(either.right([createNote([new Pitch(2, 3)], Time.newSpan(1, 4), false, ['staccato', 'fermata']), '']));
        });
        it('should parse a note token with lyrics', () => {
            expect(NoteArg('e4"Who"')).to.deep.eq(either.right([
                cloneNote(createNote([new Pitch(2, 3)], Time.newSpan(1, 4), false), { text: ['Who'] }),
                ''
            ]));
        });
    });

    describe('Rest', () => {
        it('should parse a rest token', () => {
            expect(NoteArg('r4')).to.deep.eq(either.right([createNoteFromLilypond('r4'), '']));
        });
    });

    describe('Spacer', () => {
        it('should parse a spacer token', () => {
            expect(SpacerArg('s4')).to.deep.eq(either.right([createSpacerFromLilypond('s4'), '']));
        });
    });

    describe('Key change', () => {
        /*it('should provide a regular expression', () => {
            expect(KeyArg.regex()).to.eq('(\\d+)((#)|(b))');
        });*/
        it('should parse a key token', () => {
            const res = KeyArg('3b');
            expect(res).to.deep.eq(either.right([
                StateChange.newKeyChange(new Key({ accidental: -1, count: 3 })),                 
                ''
            ]));
        });
    });
    describe('Meter change', () => {
        /*it('should provide a regular expression', () => {
            expect(MeterArg.regex()).to.eq(RationalArg.regex());
        });*/
        it('should parse a meter token', () => {
            const res = MeterArg('3/4');
            expect(res).to.deep.eq(either.right([
                StateChange.newMeterChange(MeterFactory.createRegularMeter({ value: 4, count: 3 })),                 
                ''
            ]));
        });
    });
    describe('Clef change', () => {
        /*it('should provide a regular expression', () => {
            expect(ClefArg.regex()).to.eq('(\\\\clef )(\\w+)');
        });*/
        it('should parse a clef token', () => {
            const res = ClefArg('\\clef treble');
            expect(res).to.deep.eq(either.right([
                StateChange.newClefChange(new Clef({ clefType: ClefType.G, line: -2 })),
                ''
            ]));
        });
    });

    
    describe('Split sequence', () => {
        it('should parse a split sequence', () => {
            const res = SplitSequenceArg('<< c2 \\\\ e4 f4 >>');
            expect(res).to.deep.eq(either.right([
                {
                    type: 'multi',
                    sequences: [ ['c2' ], ['e4', 'f4' ] ]
                },
                ''
            ]));
        });
    });

    
});


