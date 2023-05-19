import { Rational, RationalDef } from './rational';
export interface TimeSpan extends RationalDef {
    readonly type: 'span'
}

export interface AbsoluteTime extends RationalDef {
    readonly type: 'abs'
}

export interface ExtendedTime extends AbsoluteTime {
    readonly extended?: number;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Time {


    export const newSpan = (numerator: number, denominator: number): TimeSpan => {
        return {numerator, denominator, type: 'span'};
    };

    export const newAbsolute = (numerator: number, denominator: number): AbsoluteTime => {
        return {numerator, denominator, type: 'abs'};
    };
    export const newExtendedTime = (numerator: number, denominator: number, extended?: number): ExtendedTime => {
        return {numerator, denominator, type: 'abs', extended };
    };


    export const sortComparison = (time1: ExtendedTime, time2: ExtendedTime): number => {
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
    };


    export function fromStart(time: TimeSpan): AbsoluteTime;
    export function fromStart(time: AbsoluteTime): TimeSpan;
    export function fromStart(time: TimeSpan | AbsoluteTime): TimeSpan | AbsoluteTime {
        if (time.type === 'span') return newAbsolute(time.numerator, time.denominator);
        return newSpan(time.numerator, time.denominator);        
    }

    export const fromLilypond = (input: string): TimeSpan => {
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
    };

    export const assertSpan = (value: TimeSpan): void => {
        if (value.type !== 'span') throw 'Type error';
    };
    export const assertAbsolute = (value: AbsoluteTime): void => {
        if (value.type !== 'abs') throw 'Type error';
    };

    export const getSpan = (t1: AbsoluteTime, t2: AbsoluteTime): TimeSpan => {
        assertAbsolute(t1);
        assertAbsolute(t2);
        return { ...Rational.subtract(t2, t1), type: 'span' };
    };

    export const addSpans = (t1: TimeSpan, t2: TimeSpan): TimeSpan => {
        assertSpan(t1);
        assertSpan(t2);
        return { ...Rational.add(t2, t1), type: 'span' };
    };

    export const addTime = (t1: AbsoluteTime, t2: TimeSpan): AbsoluteTime => {
        assertAbsolute(t1);
        assertSpan(t2);
        return { ...Rational.add(t2, t1), type: 'abs' };
    };

    export const subtractTime = (t1: AbsoluteTime, t2: TimeSpan): AbsoluteTime => {
        assertAbsolute(t1);
        assertSpan(t2);
        return { ...Rational.subtract(t1, t2), type: 'abs' };
    };

    
    export const scale = (t: TimeSpan, scaleBy: number, divideBy= 1): TimeSpan =>{
        assertSpan(t);
        return { ...Rational.scale(t, scaleBy, divideBy), type: 'span' };
    };

    export const shorten = <T extends RationalDef & { type: string } >(t: T): T => {
        //this.assertSpan(t);
        return { ...Rational.shorten(t), type: t.type } as T;
    };

    export const equals = (t1: ExtendedTime, t2: ExtendedTime): boolean => {
        const res = t1.denominator * t2.numerator === t2.denominator * t1.numerator;
        if (!res || (!t1.extended && !t2.extended)) {
            return res;
        }
        return t1.extended === t2.extended;
    };

    /*export const getDotNo = (numerator0: number): number => {
        let numerator = numerator0 + 1;
        let res = -1;
        //console.log('dotNo', numerator);
        
        while (numerator > 1) {
            if ((numerator & 0x01) === 1) throw `Numerator ${numerator0} cannot be written with dots`;
            numerator >>= 1;
            res++;
            //console.log('dotNo adding', numerator, res);
        }
        return res;
    };*/

    export const StartTime = Time.newAbsolute(0, 1);
    export const StartTimeMinus = Time.newExtendedTime(0, 1, -Infinity);
    export const EternityTime = Time.newAbsolute(1, 0);    
    export const NoTime = Time.newSpan(0, 1);
    export const WholeTime = Time.newSpan(1, 1);
    export const HalfTime = Time.newSpan(1, 2);
    export const QuarterTime = Time.newSpan(1, 4);
    export const EightsTime = Time.newSpan(1, 8);
    export const InfiniteTime = Time.newSpan(1, 0);

}