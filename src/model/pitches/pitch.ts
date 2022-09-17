const pitchNames = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const accidentalNamesLy = ['eses', 'es', '', 'is', 'isis'];
const accidentalNamesEn = [' dbl flat', ' flat', '', ' sharp', ' dbl sharp'];
const accidentalNamesSymbol = ['𝄫', '♭', '♮', '♯', '𝄪'];

export class Pitch {
    /**
     * Internal values to define a pitch. Should not be used outside this class, since implementation may change.
     * @param _pitchClass c = 0, d = 1 ... b = 7
     * @param _octave middle c in octave 4 etc
     * @param _accidental 0: natural; 1: sharp; -1: flat; 2/-2 double
     */
    constructor(private _pitchClass: number, private _octave: number, private _accidental: number = 0) {}

    static fromScientific(note: string, octave: number): Pitch {
        return new Pitch(pitchNames.indexOf(note), octave, 0);
    }

    static parseScientific(input: string): Pitch {
        const matcher = /([a-g])(\d)/i;
        const parsed = matcher.exec(input);
        if (!parsed || parsed.length < 3) throw 'Illegal pitch: '+ input;
        
        return Pitch.fromScientific(parsed[1], +parsed[2]);
    }

    static parseLilypond(input: string): Pitch {
        const matcher = /([a-g])(es|is)*([',]*)/i;
        const parsed = matcher.exec(input);
        if (!parsed || parsed.length < 3) throw 'Illegal pitch: '+ input;
        let octave = 3;
        parsed[3].split('').forEach(char => {
            if (char === ',') octave--;
            if (char === '\'') octave++;
        });
        
        return Pitch.fromScientific(parsed[1], octave);
    }

    get scientific(): string {
        return this.pitchClass.toUpperCase() + this._octave;
    }
    get octave(): number {
        return this._octave;
    }

    get pitchClass(): string {
        return pitchNames[this._pitchClass];
    }

    /**
     * diatonic scale degree; C4 = 0; octave = 7
     */
    get diatonicNumber(): number {
        return this._pitchClass + 7 * (this.octave - 4);
    }

    static compare(p1: Pitch, p2: Pitch): number {
        return p1._octave * 7 + p1._pitchClass + p1._accidental / 10 - 
            ( p2._octave * 7 + p2._pitchClass + p2._accidental / 10);
    }
}