import { Clef } from './../../model/states/clef';
import { Note } from './../../model/notes/note';
/* eslint-disable comma-dangle */
import { NoteType, NoteDirection } from '../../model/notes/note';
import { ClefType } from '~/model/states/clef';
import { expect } from 'chai';
import { noteToView, FlagType } from './note-view-model';

describe('View model', () => {

    let clef: Clef;

    beforeEach(() => { 
        clef = Clef.clefTreble;
    });


});