import { GlyphCode } from './glyphs';
import { MeterViewModel } from './../../logical-view';
import { PhysicalElementBase, PhysicalFixedSizeElement } from './physical-elements';
import { Metrics } from './metrics';
import { MeterTextPart } from '../../model';
import { array } from 'fp-ts';
import R = require('ramda');
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
    '9': 'nine',
    '+': 'plus'
} as { [key: string]: GlyphCode };

function numberToGlyph(n: string): GlyphCode[] {
    return n.split('').map(ch => glyphNumbers[ch]);
}

export function convertSimpleMeter(meter: MeterTextPart, xPos: number, settings: Metrics): PhysicalElementBase[] {
    if (meter.length === 1) {
        return numberToGlyph(meter[0]).map((glyph, i) => {
            return ({
                glyph,
                position: {
                    x: xPos + i * settings.meterNumberSpacing, 
                    y: settings.scaleDegreeUnit*2 + settings.meterAdjustY
                }
            });
        });
    }

    const numerator = numberToGlyph(meter[0]);
    const denominator = numberToGlyph(meter[1]);

    const lengthDiff = numerator.length - denominator.length;
    const xOffsetNum = 0;
    const xOffsetDen = lengthDiff / 2;

    //const res = [] as PhysicalFixedSizeElement[];
    const numGlyphs = numerator.map((glyph, i) => {
        return ({
            glyph,
            position: {
                x: xPos + (i + xOffsetNum) * settings.meterNumberSpacing, 
                y: 2 * settings.scaleDegreeUnit*2 + settings.meterAdjustY
            }
        });
    });
    const denGlyphs = denominator.map((glyph, i) => {
        return ({
            glyph,
            position: {
                x: xPos + (i + xOffsetDen) * settings.meterNumberSpacing, 
                y: settings.meterAdjustY
            }
        });
    });
    return [...numGlyphs, ...denGlyphs];
}



const widthOfMeterTextPart = (meter: MeterTextPart): number => {
    return meter.reduce((prev, curr) => Math.max(prev, curr.length), 0);
};

export function convertMeter(meter: MeterViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    const meterWidths = meter.meterText.map(widthOfMeterTextPart);

    const offsets = R.scan<number, number>((acc, elem) => acc + elem * settings.meterNumberSpacing, xPos)(meterWidths);
    
    return array.chainWithIndex((i: number, mvp: MeterTextPart) => convertSimpleMeter(mvp, offsets[i], settings))(meter.meterText);
}


export function calculateMeterWidth(meter: MeterViewModel, settings: Metrics): number {

    const totalLength = meter.meterText.reduce((prev, curr) => prev + widthOfMeterTextPart(curr), 0);
    return settings.meterNumberSpacing * totalLength;
}