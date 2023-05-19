import { getDotNo, getDuration, getNoteType, getUndottedDuration, Rational } from './../../model';
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
/*
function HSVtoRGB(h: number, s: number, v: number) {
    
    const r = v * (Math.sin(h * Math.PI * 2) + 1);
    const g = v * (Math.sin((h + 1/3) * Math.PI * 2) + 1);
    const b = v * (Math.sin((h - 1/3) * Math.PI * 2) + 1);

    console.log(r,g,b);
    
    return [
        Math.round(r * 127).toString(16).padStart(2, '0'),
        Math.round(g * 127).toString(16).padStart(2, '0'),
        Math.round(b * 127).toString(16).padStart(2, '0')
    ].join('');
}
*/




export function noteToView(note: Note, clef: Clef): NoteViewModel {
    const positions = note.pitches.map(p => clef.map(p)).sort();
    let direction = note.direction;
    if (!direction) {
        const middlePos2 = positions[0] + positions[positions.length - 1];
        direction = middlePos2 <= 0 ? NoteDirection.Up : NoteDirection.Down;
    }
    let flagType = FlagType.None;

    const duration = getUndottedDuration(note);

    if (duration.denominator >= 8) {
        switch (duration.denominator) {
            case 8: flagType = FlagType.F1; break;
            case 16: flagType = FlagType.F2; break;
            case 32: flagType = FlagType.F3; break;
            case 64: flagType = FlagType.F4; break;
            case 128: flagType = FlagType.F5; break;
            default: flagType = FlagType.None; throw 'Illegal duration: ' + Rational.toString(getDuration(note)); break;
        }
    }
    const res: NoteViewModel = {
        positions,
        noteType: getNoteType(note),
        direction,
        flagType
        //,colors: note.pitches.map(p => '#' + HSVtoRGB(((p.pitchClass.circleOf5Number + 56) % 12)/12, 1, .7))
    };

    const dotNo = getDotNo(note);
    if (dotNo) res.dotNo = dotNo;
    if (note.grace) res.grace = true;
    if (note.uniq) res.uniq = note.uniq;
    if (note.tupletFactor) res.tuplet = true;
    if (note.expressions) res.expressions = [...note.expressions];
    if (note.text) res.text = [...note.text];

    return res;
}