import { GlyphCode } from './glyphs';
import { Accidental } from './../../model/pitches/pitch';
import { AccidentalViewModel } from './../../logical-view';
import { PhysicalElementBase } from './physical-elements';
import { Metrics } from './metrics';
import { KeyViewModel } from './../../logical-view';
import { scaleDegreeToY } from './functions';

function accidentalToGlyph(alt: Accidental): GlyphCode {
    switch (alt) {
        case -2: return 'accidentals.flatflat';
        case -1: return 'accidentals.M2';
        case 0: return 'accidentals.0';
        case 1: return 'accidentals.2';
        case 2: return 'accidentals.doublesharp';
        default: throw 'Illegal accidental: ' + alt;
    }
}

export function convertKey(key: KeyViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    return key.keyPositions.map((pos, i) => {
        return {
            glyph: accidentalToGlyph(pos.alteration),
            position: {x: xPos + i * settings.keySigSpacing, y: scaleDegreeToY(pos.position, settings)}
        };
    });
}

export function convertAccidentals(accidentals: AccidentalViewModel[], xPos: number, settings: Metrics): PhysicalElementBase[] {
    return accidentals.map((pos) => {
        return {
            glyph: accidentalToGlyph(pos.alteration),
            position: {x: xPos + pos.displacement * settings.accidentalDisplacement, y: scaleDegreeToY(pos.position, settings)}
        };
    });
}

