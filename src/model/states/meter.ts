import { CompositeMeterDef, MeterDef, RegularMeterDef, isCompositeMeterDef, isRegularMeterDef } from './../data-only/states';
import { Rational, RationalDef } from '../rationals/rational';
import { TimeMap } from '../../tools/time-map';
import { AbsoluteTime } from './../rationals/time';
import { Time, TimeSpan } from '../rationals/time';
import R = require('ramda');
import { array } from 'fp-ts';


export type MeterTextPart = [string, string] | [string];

export type MeterText = MeterTextPart[];

export interface Meter {
    equals(meter: Meter): boolean;
    type: string;
    measureLength: TimeSpan;
    countingTime: TimeSpan[];
    text: MeterText;
    firstBarTime: AbsoluteTime;
    upbeat: TimeSpan;
    def: RegularMeterDef | CompositeMeterDef;
}

export class MeterFactory {
    static createRegularMeter(def: RegularMeterDef): RegularMeter {
        return new RegularMeter(def);
    }
    static createCompositeMeter(def: CompositeMeterDef): CompositeMeter {
        return new CompositeMeter(def);
    }
    static createMeter(def: MeterDef): Meter {
        if (isRegularMeterDef(def)) return this.createRegularMeter(def);
        if (isCompositeMeterDef(def)) return this.createCompositeMeter(def);
        throw 'Illegal meter definition';
    }
}

function isRegularMeter(meter: Meter): meter is RegularMeter {
    return meter.type === 'RegularMeter';
}

class RegularMeter implements Meter {
    public def: RegularMeterDef;
    constructor(def: RegularMeterDef) {
        this.def = {...def};
    }
    get type() { return 'RegularMeter'; }

    equals(meter: Meter): boolean {
        if (!isRegularMeter(meter)) return false;

        if (this.def.upBeat && ! (meter as RegularMeter).def.upBeat) return false;
        if (!this.def.upBeat && (meter as RegularMeter).def.upBeat) return false;

        let upbeatIdentical = false;
        if (!this.def.upBeat && !(meter as RegularMeter).def.upBeat) { 
            upbeatIdentical = true;
        } else if (Rational.compare(this.def.upBeat as RationalDef, (meter as RegularMeter).def.upBeat as RationalDef) === 0) {
            upbeatIdentical = true;
        }
        return this.def.count === (meter as RegularMeter).def.count && 
            this.def.value === (meter as RegularMeter).def.value && 
            upbeatIdentical;
    }
    get countingTime(): TimeSpan[] {
        if (this.def.count % 3 === 0 && this.def.count !== 3) {
            return [{ numerator: 3, denominator: this.def.value, type: 'span' }];    
        }
        return [{ numerator: 1, denominator: this.def.value, type: 'span' }];
    }
    get measureLength(): TimeSpan {
        return Time.shorten(Time.newSpan(this.def.count, this.def.value));
    }
    get text(): MeterText {
        return [['' + this.def.count, '' + this.def.value]];
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

function isCompositeMeter(meter: Meter): meter is CompositeMeter {
    return meter.type === 'CompositeMeter';
}

export class CompositeMeter implements Meter {
    def: CompositeMeterDef;

    constructor(def: CompositeMeterDef) {
        if (!def.meters.length) throw 'Empty meter';
        this.def = {...def};
        this.internalMeters = def.meters.map(meterDef => MeterFactory.createRegularMeter(meterDef));
    }

    get type(): string { return 'CompositeMeter'; }

    internalMeters: RegularMeter[];

    equals(meter: Meter): boolean {
        if (!isCompositeMeter(meter)) return false;

        if (this.def.commonDenominator !== meter.def.commonDenominator) return false;
        if (this.def.meters.length !== meter.def.meters?.length) return false;

        for (let i = 0; i < this.internalMeters.length; i++) {
            if (!this.internalMeters[i].equals(meter?.internalMeters[i])) return false;
        }

        return true;
    }

    get countingTime(): TimeSpan[] {
        return this.internalMeters.map(m => m.measureLength);
    }
    get measureLength(): TimeSpan {
        return this.internalMeters.reduce((t2: TimeSpan, t1: Meter) => Time.addSpans(t2, t1.measureLength), Time.NoTime);
    }
    get text(): MeterText {
        if (this.def.commonDenominator) {
            const denominator = this.internalMeters[0].def.value;
            const failing = this.internalMeters.find(item => item.def.value !== denominator);
            if (failing) throw 'Cannot have common denominator';
            const resUpper = this.internalMeters.map(item => item.def.count).join('+');
            return [[resUpper, '' + denominator]];
        }
        return R.intersperse<MeterTextPart>(['+'], array.chain<Meter, MeterTextPart>(mt => mt.text)(this.internalMeters));
    }
    get firstBarTime(): AbsoluteTime {
        return Time.fromStart(this.measureLength);
    }
    get upbeat(): TimeSpan {
        return Time.newSpan(0, 1);
    }

}


export function* getAllBars(meter: Meter, startTime?: AbsoluteTime): IterableIterator<AbsoluteTime> {
    let time = startTime ? startTime : meter.firstBarTime;
    while (true) {
        yield time;
        time = Time.addTime(time, meter.measureLength);
    }
}

export function* getAllBeats(meter: Meter, startTime?: AbsoluteTime): IterableIterator<AbsoluteTime> {
    let time = startTime ? startTime : Time.fromStart(meter.upbeat);
    let beatIndex = 0;
    const meterGroups = meter.countingTime;
    const meterGroupLength = meterGroups.length;

    if (Time.equals(time, Time.newAbsolute(0, 1))) {
        time = Time.fromStart(meter.countingTime[beatIndex % meterGroupLength]);
        beatIndex++;
    }
    while (true) {
        yield time;
        time = Time.addTime(time, meter.countingTime[beatIndex % meterGroupLength]);
        beatIndex++;
    }
}

export class MeterMap extends TimeMap<Meter> {
    *getAllBeats(): IterableIterator<AbsoluteTime> {
        let meter = this.items[0].value;
        let time = meter.upbeat ? Time.fromStart(meter.upbeat) : Time.newAbsolute(0, 1);
        let iterator = getAllBeats(meter, time);

        let beatIndex = 0;
        const meterGroups = meter.countingTime;
        let meterGroupLength = meterGroups.length;
    

        while (true) {
            const latestMeter = this.peekLatest(time);
            if (latestMeter && latestMeter !== meter) {
                meter = latestMeter;
                iterator = getAllBeats(meter, time);
                iterator.next();
                //yield time;
                //continue;
                beatIndex = 0;
                const meterGroups = meter.countingTime;
                meterGroupLength = meterGroups.length;
        
            }
            const res = iterator.next();
            if (res.done) return;
            yield res.value;
            time = Time.addTime(time, meter.countingTime[beatIndex % meterGroupLength]);
            beatIndex++;
        }        
    }

    *getAllBars(): IterableIterator<AbsoluteTime> {
        let meter = this.items[0].value;
        let time = meter.upbeat ? Time.fromStart(meter.upbeat) : Time.newAbsolute(0, 1);
        let iterator = getAllBars(meter, time);
        while (true) {
            const latestMeter = this.peekLatest(time);
            if (latestMeter && latestMeter !== meter) {
                meter = latestMeter;
                iterator = getAllBars(meter, time);
            }
            const res = iterator.next();
            if (res.done) return;
            yield res.value;
            time = Time.addTime(time, meter.measureLength);
        }        
    }
}

export function meterToLilypond(meter: Meter): string {
    if (isRegularMeter(meter)) {
        const regularDef = meter.def;
        return `\\meter ${regularDef.count}/${regularDef.value}`;
    }
    if (isCompositeMeter(meter)) {
        if (meter.def.commonDenominator) {
            return '\\compoundMeter #\'' + '((' + meter.internalMeters.map(intMet => {
                return `${intMet.def.count}`;
            }).join(' ') + ` ${meter.internalMeters[0].def.value}))`;
        }
        return '\\compoundMeter #\'' + '(' + meter.internalMeters.map(intMet => {
            return `(${intMet.def.count} ${intMet.def.value})`;
        }).join(' ') + ')';
    }
    throw 'Illegal meter';
}