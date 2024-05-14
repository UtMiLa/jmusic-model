import { MusicEvent, SequenceDef } from './..';
import { Time, AbsoluteTime } from './../rationals/time';
import { TimeSpan } from '../rationals/time';
import { BaseSequence, ISequence } from '../score/sequence';
import { StateChange } from '../states/state';
import { Note, setNoteText } from './note';

export function mapLyricsToMusic(lyrics: string, music: MusicEvent[]): MusicEvent[] {
    const lyricsSplit = lyrics.split(' ');
    let i = 0;
    return music.map(elm => { 
        const note = elm as Note;
        if (note.pitches && note.pitches.length) {
            const theText = note.text ? [...note.text, lyricsSplit[i++]] :  [lyricsSplit[i++]];
            return setNoteText(note, theText);
        }
        return elm;            
    });    
}

export class LyricsSequence extends BaseSequence {
    /**
     * @param seq Sequence to bind lyrics to
     * @param lyricsText string of syllables, separated by spaces; syllables can end with minus to indicate hyphenation. Syllables can be minuses to indicate melismas.
     * Todo: how to indicate extensions with underscores?
     */
    constructor(private sequence: ISequence, public lyricsText: string) {
        super();
    }

    
    public get asObject(): SequenceDef {
        return [{ function: 'AddLyrics', args: [this.sequence.asObject], extraArgs: [this.lyricsText] }];
    }
    public set asObject(value: SequenceDef) {
        throw 'Not supported';
    }
    

    get elements(): MusicEvent[] {
        return mapLyricsToMusic(this.lyricsText, this.sequence.elements);

    }

    duration: TimeSpan = this.sequence.duration;

    insertElements(time: AbsoluteTime, elm: MusicEvent[]): void {
        throw new Error('Method not implemented.');    
    }

}
