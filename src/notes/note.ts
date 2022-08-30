import { TimeSpan, Time } from './../rationals/time';
import { Pitch } from './../pitches/pitch';
export class Note {
    constructor(private _pitch: Pitch, private _duration: TimeSpan) {
        //console.log('new note', _pitch, _duration);
        
    }
    static parseLily(input: string): Note {
        const matcher = /([a-g](es|is)*[',]*)(\d+\.*)/i;
        const match = matcher.exec(input);
        if (!match || match.length < 4) throw 'Illegal note: ' + input;
        const pitchLily = match[1];
        const durationLily = match[3];
        //console.log(match);
        
        return new Note(Pitch.parseLilypond(pitchLily), Time.fromLilypond(durationLily));
    }

    get pitch(): Pitch {
        return this._pitch;
    }

    get duration(): TimeSpan {
        return this._duration;
    }
}