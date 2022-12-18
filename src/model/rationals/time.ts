import { Rational, RationalDef } from './rational';
export interface TimeSpan extends RationalDef {
    type: 'span'
}

export interface AbsoluteTime extends RationalDef {
    type: 'abs'
}

export interface ExtendedTime extends AbsoluteTime {
    extended?: number;
}

export class Time {

    static StartTime = Time.newAbsolute(0, 1);
    static EternityTime = Time.newAbsolute(1, 0);
    
    static NoTime = Time.newSpan(0, 1);
    static WholeTime = Time.newSpan(1, 1);
    static HalfTime = Time.newSpan(1, 2);
    static QuarterTime = Time.newSpan(1, 4);
    static EightsTime = Time.newSpan(1, 8);
    static InfiniteTime = Time.newSpan(1, 0);


    static sortComparison(time1: ExtendedTime, time2: ExtendedTime): number {
        const res = time1.numerator * time2.denominator - time2.numerator * time1.denominator;
        if (res !== 0) return res;
        if (time1.extended) {
            if (time2.extended) {
                return time1.extended - time2.extended;
            } else {
                return time1.extended;
            }
        } else {            
            if (time2.extended) {
                return -time2.extended;
            } else {
                return 0;
            }
        }
    }

    static newSpan(numerator: number, denominator: number): TimeSpan {
        return {numerator, denominator, type: 'span'};
    }

    static newAbsolute(numerator: number, denominator: number): AbsoluteTime {
        return {numerator, denominator, type: 'abs'};
    }

    static newExtendedTime(numerator: number, denominator: number, extended?: number): ExtendedTime {
        return {numerator, denominator, type: 'abs', extended };
    }

    static fromStart(time: TimeSpan): AbsoluteTime;
    static fromStart(time: AbsoluteTime): TimeSpan;
    static fromStart(time: TimeSpan | AbsoluteTime): TimeSpan | AbsoluteTime {
        if (time.type === 'span') return this.newAbsolute(time.numerator, time.denominator);
        return this.newSpan(time.numerator, time.denominator);        
    }

    static fromLilypond(input: string): TimeSpan {
        const matcher = /(\d+)(\.*)/;
        const parsed = matcher.exec(input);
        if (!parsed) throw 'Illegal duration: ' + input;
        let numerator = 1;
        let denominator = +parsed[1];

        parsed[2].split('').forEach(char => {
            if (char === '.') {
                numerator = numerator * 2 + 1;
                denominator *= 2;
            }
        });

        //console.log(parsed, numerator, denominator);
        return Time.newSpan(numerator, denominator);
    }

    public static assertSpan(value: TimeSpan): void {
        if (value.type !== 'span') throw 'Type error';
    }
    public static assertAbsolute(value: AbsoluteTime): void {
        if (value.type !== 'abs') throw 'Type error';
    }

    public static getSpan(t1: AbsoluteTime, t2: AbsoluteTime): TimeSpan {
        this.assertAbsolute(t1);
        this.assertAbsolute(t2);
        return { ...Rational.subtract(t2, t1), type: 'span' };
    }

    static addSpans(t1: TimeSpan, t2: TimeSpan): TimeSpan {
        this.assertSpan(t1);
        this.assertSpan(t2);
        return { ...Rational.add(t2, t1), type: 'span' };
    }

    static addTime(t1: AbsoluteTime, t2: TimeSpan): AbsoluteTime {
        this.assertAbsolute(t1);
        this.assertSpan(t2);
        return { ...Rational.add(t2, t1), type: 'abs' };
    }

    static subtractTime(t1: AbsoluteTime, t2: TimeSpan): AbsoluteTime {
        this.assertAbsolute(t1);
        this.assertSpan(t2);
        return { ...Rational.subtract(t1, t2), type: 'abs' };
    }

    
    static scale(t: TimeSpan, scaleBy: number, divideBy= 1): TimeSpan {
        this.assertSpan(t);
        return { ...Rational.scale(t, scaleBy, divideBy), type: 'span' };
    }

    static shorten<T extends RationalDef & { type: string } >(t: T): T {
        //this.assertSpan(t);
        return { ...Rational.shorten(t), type: t.type } as T;
    }

    static equals(t1: ExtendedTime, t2: ExtendedTime): boolean {
        const res = t1.denominator * t2.numerator === t2.denominator * t1.numerator;
        if (!res || (!t1.extended && !t2.extended)) {
            return res;
        }
        return t1.extended === t2.extended;
    }

    static getDotNo(numerator: number): number {
        numerator++;
        let res = -1;
        //console.log('dotNo', numerator);
        
        while (numerator > 1) {
            numerator >>= 1;
            res++;
            //console.log('dotNo adding', numerator, res);
        }
        return res;
    }

}