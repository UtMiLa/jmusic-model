import { VoiceDef } from './../../model/score/voice';
import { SequenceDef } from './../../model/score/sequence';
import { keyToView, KeyViewModel } from './convert-key';
import { noteToView, NoteViewModel } from './note-view-model';
import { ClefType } from '../../model/states/clef';
import { Note, NoteDirection, NoteType } from '../../model/notes/note';
import { Clef } from '../../model/states/clef';
import { Sequence } from '../../model/score/sequence';
import { StaffDef } from '../../model/score/staff';
import { convertKey } from '../../physical-view/physical/physical-key';
import { Key } from '../../model/states/key';

export interface ClefViewModel {
    position: number;
    clefType: ClefType;
    line: number;
}

export interface StaffViewModel {
    objects: (NoteViewModel | ClefViewModel | KeyViewModel)[];
}

export interface ScoreViewModel {
    staves: StaffViewModel[];
}

export function modelToViewModel(def: StaffDef): StaffViewModel {

    if (!def.voices) { 
        if (!def.seq) throw 'seq and voices undefined';

        def.voices = [{ content: def.seq }];
    }

    //const seq = def.voices.map(voice => new Sequence(voice.content));
    console.log('vc', def.voices);

    const clef = new Clef(def.initialClef);

    return {
        objects: ([
            { 
                position: 1,
                clefType: def.initialClef.clefType,
                line: def.initialClef.line
            },
            keyToView(new Key(def.initialKey), new Clef(def.initialClef))
        ] as (NoteViewModel | ClefViewModel | KeyViewModel)[]).concat(
            def.voices
                .map(voiceNotesToView(clef))
                .reduce((prev, curr) => prev.concat(curr), [] as NoteViewModel[])
        )
    };
}

function voiceNotesToView(clef: Clef): (value: VoiceDef, index: number, array: VoiceDef[]) => NoteViewModel[] {
    return voice => (new Sequence(voice.content))
        .elements
        .map(elem => { 
            const noteClone = Note.clone(elem, { direction: elem.direction ? elem.direction : voice.noteDirection });
            const noteView = noteToView(noteClone, clef);
            return noteView;
        });
}
