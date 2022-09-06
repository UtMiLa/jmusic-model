import { Rational, RationalDef } from './rational';
export interface TimeSpan extends RationalDef {
    type: 'span'
}

export interface AbsoluteTime extends RationalDef {
    type: 'abs'
}

export class Time {

    static newSpan(numerator: number, denominator: number): TimeSpan {
        return {numerator, denominator, type: 'span'};
    }

    static newAbsolute(numerator: number, denominator: number): AbsoluteTime {
        return {numerator, denominator, type: 'abs'};
    }

    static fromLilypond(input: string) {
        const matcher = /(\d+)(\.*)/;
        const parsed = matcher.exec(input);
        if (!parsed) throw 'Illegal duration: ' + input;
        let numerator = 1;
        let denominator = +parsed[1];

        parsed[2].split('').forEach(char => {
            if (char === '.') {
                numerator += denominator;
                denominator *= 2;
            }
        });

        //console.log(parsed, numerator, denominator);
        return Time.newSpan(numerator, denominator);
    }

    public static assertSpan(value: TimeSpan) {
        if (value.type !== 'span') throw 'Type error';
    }
    public static assertAbsolute(value: AbsoluteTime) {
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
    
    static scale(t: TimeSpan, s: number): TimeSpan {
        this.assertSpan(t);
        return { ...Rational.scale(t, s), type: 'span' };
    }
}