import { Rational } from './../../model';
import { Clef } from './../../model';
import { NoteDirection, Note } from '../../model';
import { FlagType, NoteViewModel } from './note-view-model';

/*function HSVtoRGB(h: number, s: number, v: number) {
    let r: number, g: number, b: number, i: number, f: number, p: number, q: number, t: number;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    r = 0;
    g = 0;
    b = 0;
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255).toString(16).padStart(2, '0'),
        Math.round(g * 255).toString(16).padStart(2, '0'),
        Math.round(b * 255).toString(16).padStart(2, '0')
    ].join('');
}*/




export function noteToView(note: Note, clef: Clef): NoteViewModel {
    const positions = note.pitches.map(p => clef.map(p)).sort();
    let direction = note.direction;
    if (!direction) {
        const middlePos2 = positions[0] + positions[positions.length - 1];
        direction = middlePos2 <= 0 ? NoteDirection.Up : NoteDirection.Down;
    }
    let flagType = FlagType.None;

    const duration = note.undottedDuration;

    if (duration.denominator >= 8) {
        switch (duration.denominator) {
            case 8: flagType = FlagType.F1; break;
            case 16: flagType = FlagType.F2; break;
            case 32: flagType = FlagType.F3; break;
            case 64: flagType = FlagType.F4; break;
            case 128: flagType = FlagType.F5; break;
            default: flagType = FlagType.None; throw 'Illegal duration: ' + Rational.toString(note.duration); break;
        }
    }
    const res: NoteViewModel = {
        positions,
        noteType: note.type,
        direction,
        flagType
        //,colors: note.pitches.map(p => '#' + HSVtoRGB(((p.pitchClass.circleOf5Number + 50) % 12)/12, 1, .7))
    };

    if (note.dotNo) res.dotNo = note.dotNo;
    if (note.uniq) res.uniq = note.uniq;
    if (note.tupletFactor) res.tuplet = true;
    if (note.expressions) res.expressions = [...note.expressions];
    if (note.text) res.text = [...note.text];

    return res;
}