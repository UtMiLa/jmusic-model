import { MusicEvent } from './../score/sequence';
import { Time, AbsoluteTime } from './../rationals/time';
import { TimeSpan } from '../rationals/time';
import { BaseSequence, ISequence } from '../score/sequence';
import { StateChange } from '../states/state';
import { Note } from './note';

export class LyricsSequence extends BaseSequence {
    /**
     * @param seq Sequence to bind lyrics to
     * @param lyricsText string of syllables, separated by spaces; syllables can end with minus to indicate hyphenation. Syllables can be minuses to indicate melismas.
     * Todo: how to indicate extensions with underscores?
     */
    constructor(private sequence: ISequence, public lyricsText: string) {
        super();
    }

    get elements(): MusicEvent[] {
        const lyricsSplit = this.lyricsText.split(' ');
        let i = 0;
        return this.sequence.elements.map(elm => { 
            const note = elm as Note;
            if (note.pitches && note.pitches.length) {
                const theText = note.text ? [...note.text, lyricsSplit[i++]] :  [lyricsSplit[i++]];
                return Note.clone(note, { text: theText });
            }
            return elm;            
        });
    }

    duration: TimeSpan = this.sequence.duration;

    insertElement(time: AbsoluteTime, elm: MusicEvent): void {
        throw new Error('Method not implemented.');    }

}
