import { PitchArg } from './../../editor/text-commands/argument-types';
import {mathMod}  from 'ramda';
import R = require('ramda');
import { either } from 'fp-ts';
import { Interval, addInterval } from './intervals';

const pitchNames = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const accidentalNamesLy = ['eses', 'es', '', 'is', 'isis'];
const accidentalNamesEn = [' dbl flat', ' flat', '', ' sharp', ' dbl sharp'];
const accidentalNamesSymbol = ['𝄫', '♭', '♮', '♯', '𝄪'];

export type Alteration = -2 | -1 | 0 | 1 | 2; // -2 = 𝄫 ... 2 = 𝄪 

export type Accidental = Alteration | undefined; // 0: ♮; undefined: nothing

export function fromLilypondPitchClass(input: string): number {
    const res = pitchNames.indexOf(input);
    if (res === -1) throw 'Illegal pitch name';
    return res;
}

export function fromLilypondAlteration(input: string): Alteration {
    const res = accidentalNamesLy.indexOf(input);
    if (res === -1) throw 'Illegal alteration';
    return res - 2 as Alteration;
}

export function fromLilypondOctave(input: string): number {
    return input.split('').reduce((a, b) => b === ',' ? a - 1 : a + 1, 3);
}

export interface PitchDef {
    type: 'Pitch';
    data: [number, number, number];
}
export class Pitch {

    /**
     * Internal values to define a pitch. Should not be used outside this class, since implementation may change.
     * @param _pitchClass c = 0, d = 1 ... b = 7
     * @param _octave middle c in octave 4 etc
     * @param _accidental 0: natural; 1: sharp; -1: flat; 2/-2 double
     */
    constructor(private _pitchClass: number, private _octave: number, private _accidental: Alteration = 0) {}

    static fromScientific(note: string, octave: number): Pitch {
        return new Pitch(pitchNames.indexOf(note), octave, 0);
    }

    public static fromMidi(midiNo: number): Pitch {
        const pitch = Math.floor(7 * (midiNo - 56) / 12) - 2;        
        const alterationNo = midiNo - Math.floor(12 * (pitch + 1) / 7) - 59;
        return new Pitch(mathMod(pitch, 7), Math.trunc((midiNo) / 12) - 1, alterationNo as Alteration);
    }

    public get midi(): number {
        return 12 * this._octave + Math.floor(12 * (this._pitchClass + 1) / 7) + 11 + this.alteration;
    }

    static parseScientific(input: string): Pitch {
        const matcher = /([a-g])(\d)/i;
        const parsed = matcher.exec(input);
        if (!parsed || parsed.length < 3) throw 'Illegal pitch: '+ input;
        
        return Pitch.fromScientific(parsed[1], +parsed[2]);
    }

    static parseLilypond(input: string): Pitch {
        /*const matcher = /([a-g])((es|is)*)([',]*)$/i;
        const parsed = matcher.exec(input);
        
        if (!parsed || parsed.length < 3) throw 'Illegal pitch: '+ input;

        const alteration = fromLilypondAlteration(parsed[2]);
        const octave = fromLilypondOctave(parsed[4]);
        const pitchClass = fromLilypondPitchClass(parsed[1]);

        return new Pitch(pitchClass, octave, alteration);        */
        //return _eitherToException(PitchArg)(input)[0];
        return either.getOrElse<string, [Pitch, string]>((e) => {throw e;})(PitchArg(input))[0];
    }

    get lilypond(): string {
        const scaleDegree = this.pitchClassName;
        //const alteration = accidentalNamesLy[this._accidental + 2];
        let octave = '';
        if (this.octave > 3)
            octave = Array(this.octave - 3).fill('\'').join('');
        else if (this.octave < 3)
            octave = Array(3 - this.octave).fill(',').join('');
        return scaleDegree + /*alteration +*/ octave;
    }

    get scientific(): string {
        return this.pitchClassName.toUpperCase() + this._octave;
    }
    get octave(): number {
        return this._octave;
    }

    get pitchClassName(): string {
        return pitchNames[this._pitchClass] + accidentalNamesLy[this._accidental + 2];
    }

    get pitchClassNumber(): number {
        return this._pitchClass;
    }

    get pitchClass(): PitchClass {
        return new PitchClass(this._pitchClass, this._accidental);
    }

    get alteration(): Alteration {
        return this._accidental;
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

    getDef(): PitchDef {
        return {
            type: 'Pitch',
            data: [this._pitchClass, this._octave, this._accidental]
        };
    }
}

export class PitchClass {
    constructor(private _pitchClass: number, private _accidental: Alteration = 0) {}

    /** 0 = C, +1 = diatonic step up (1 = D, 2 = E) etc */    
    get pitchClass(): number {
        return this._pitchClass;
    }
    /** 0 = C, +1 = fifth up (1 = G, 2 = D), -1 = fifth down (-1 = F etc) */    
    get circleOf5Number(): number {
        return mathMod(2 * this._pitchClass + 1, 7) - 1 + 7 * this._accidental;
    }
    static fromCircleOf5(co5: number): PitchClass {

        const accidental = Math.floor((co5 + 1) / 7);
        //const pitchClass = Math.floor(((co5 + 1 - 7 * accidental) - 1) / 2);
        const pitchClass = R.mathMod((4 * (co5 - 7 * accidental)), 7);

        return new PitchClass(pitchClass, accidental as Alteration);
    }
    get pitchClassName(): string {
        return pitchNames[this._pitchClass] + accidentalNamesLy[this._accidental + 2];
    }
    get alteration(): Alteration {
        return this._accidental;
    }

    transpose(interval: Interval): PitchClass {
        return addInterval(new Pitch(this._pitchClass, 4, this._accidental), interval).pitchClass;
    }
}
