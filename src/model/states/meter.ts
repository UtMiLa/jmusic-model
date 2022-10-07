import { AbsoluteTime } from './../rationals/time';
import { Rational } from '../rationals/rational';
import { Time, TimeSpan } from '../rationals/time';
export interface Meter {
    measureLength: TimeSpan;
    countingTime: TimeSpan;
    text: string[];
    firstBarTime: AbsoluteTime;
    upbeat: TimeSpan;
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

class RegularMeter implements Meter {
    private def: RegularMeterDef;
    constructor(def: RegularMeterDef) {
        this.def = {...def};
    }
    get countingTime(): TimeSpan {
        if (this.def.count % 3 === 0 && this.def.count !== 3) {
            return { numerator: 3, denominator: this.def.value, type: 'span' };    
        }
        return { numerator: 1, denominator: this.def.value, type: 'span' };
    }
    get measureLength(): TimeSpan {
        //return { ...Rational.shorten({}), type: 'span'};
        return Time.shorten(Time.newSpan(this.def.count, this.def.value));// .scale(this.countingTime, this.def.count);
    }
    get text(): string[] {
        return ['' + this.def.count, '' + this.def.value];
    }

    get firstBarTime(): AbsoluteTime {        
        if (this.def.upBeat)
            return Time.fromStart(this.def.upBeat);
        return Time.fromStart(this.measureLength);
    }

    get upbeat(): TimeSpan {
        return this.def.upBeat ?? Time.newSpan(0, 1);
    }

}

class CompositeMeter implements Meter {
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
    get upbeat(): TimeSpan {
        return Time.newSpan(0, 1);
    }

}


export function* getAllBars(meter: Meter): IterableIterator<AbsoluteTime> {
    let time = meter.firstBarTime;
    while (true) {
        yield time;
        time = Time.addTime(time, meter.measureLength);
    }
}

export function* getAllBeats(meter: Meter): IterableIterator<AbsoluteTime> {
    let time = Time.fromStart(meter.upbeat);
    if (Time.equals(time, Time.newAbsolute(0, 1))) {
        time = Time.fromStart(meter.countingTime);
    }
    while (true) {
        yield time;
        time = Time.addTime(time, meter.countingTime);
    }
}

