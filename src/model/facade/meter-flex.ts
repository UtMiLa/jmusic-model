import { parseLilyMeter } from '../score/sequence';
import { Meter, RegularMeterDef } from '..';

/** Tolerant input type for meters: a Meter object, a RegularMeterDef definition, or a string in Lilypond format */
export type MeterFlex = Meter | RegularMeterDef | string;



export function makeMeter(input: MeterFlex): RegularMeterDef {

    if (typeof (input) === 'string') {
        return parseLilyMeter('\\meter ' + input).def as RegularMeterDef;
    }
    const cd = input as RegularMeterDef;
    if (cd.value !== undefined && cd.count !== undefined ) {
        return cd;
    }
    return (input as Meter).def as RegularMeterDef;
}