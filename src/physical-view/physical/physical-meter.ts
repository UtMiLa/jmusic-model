import { GlyphCode } from './glyphs';
import { MeterViewModel } from './../../logical-view';
import { PhysicalElementBase, PhysicalFixedSizeElement } from './physical-elements';
import { Metrics } from './metrics';
/*
export function testMeter(viewModel: any): MeterViewModel | undefined {
    return viewModel.keyPositions ? viewModel as KeyViewModel : undefined;
}
*/

const glyphNumbers = {
    '0': 'zero', 
    '1': 'one', 
    '2': 'two', 
    '3': 'three', 
    '4': 'four', 
    '5': 'five', 
    '6': 'six', 
    '7': 'seven', 
    '8': 'eight', 
    '9': 'nine'
} as { [key: string]: GlyphCode };

function numberToGlyph(n: string): GlyphCode[] {
    return n.split('').map(ch => glyphNumbers[ch]);
}

export function convertMeter(meter: MeterViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    const numerator = numberToGlyph(meter.meterText[0]);
    const denominator = numberToGlyph(meter.meterText[1]);

    const res = [] as PhysicalFixedSizeElement[];
    numerator.forEach((glyph, i) => {
        res.push({
            glyph,
            position: {
                x: xPos + i * settings.meterNumberSpacing, 
                y: 2 * settings.scaleDegreeUnit*2 + settings.meterAdjustY
            }
        });
    });
    denominator.forEach((glyph, i) => {
        res.push({
            glyph,
            position: {
                x: xPos + i * settings.meterNumberSpacing, 
                y: settings.meterAdjustY
            }
        });
    });
    return res;
}