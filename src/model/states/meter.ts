import { AbsoluteTime } from './../rationals/time';
import { Rational } from '../rationals/rational';
import { Time, TimeSpan } from '../rationals/time';
export interface Meter {
    measureLength: TimeSpan;
    countingTime: TimeSpan;
    text: string[];
    firstBarTime: AbsoluteTime;
}

export interface RegularMeterDef {
    count: number;
    value: number;
    upBeat?: TimeSpan;
}

export interface CompositeMeterDef {
    meters: RegularMeterDef[];
    commonDenominator?: boolean;
}

export class MeterFactory {
    static createRegularMeter(def: RegularMeterDef): Meter {
        return new RegularMeter(def);
    }
    static createCompositeMeter(def: CompositeMeterDef): Meter {
        return new CompositeMeter(def);
    }
}

class RegularMeter {
    private def: RegularMeterDef;
    constructor(def: RegularMeterDef) {
        this.def = {...def};
    }
    get countingTime(): TimeSpan {
        return { numerator: 1, denominator: this.def.value, type: 'span' };
    }
    get measureLength(): TimeSpan {
        //return { ...Rational.shorten({}), type: 'span'};
        return Time.scale(this.countingTime, this.def.count);
    }
    get text(): string[] {
        return ['' + this.def.count, '' + this.def.value];
    }

    get firstBarTime(): AbsoluteTime {        
        if (this.def.upBeat)
            return Time.fromStart(this.def.upBeat);
        return Time.fromStart(this.measureLength);
    }
}

class CompositeMeter {
    private def: CompositeMeterDef;
    constructor(def: CompositeMeterDef) {
        if (!def.meters.length) throw 'Empty meter';
        this.def = {...def};
    }
    get countingTime(): TimeSpan {
        return { numerator: 1, denominator: this.def.meters[0].value, type: 'span' };
    }
    get measureLength(): TimeSpan {
        //return { ...Rational.shorten({}), type: 'span'};
        return { numerator: 1, denominator: 1, type: 'span' };
    }
    get text(): string[] {
        return ['4', '4'];
    }
    get firstBarTime(): AbsoluteTime {
        return Time.fromStart(this.measureLength);
    }
}