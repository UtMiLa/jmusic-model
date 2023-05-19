import { Time, TimeSpan } from './time';

export function getDotNumber(value: TimeSpan): number {
    let numerator = value.numerator + 1;
    let res = -1;
    //console.log('dotNo', numerator);
    
    while (numerator > 1) {
        if ((numerator & 0x01) === 1) throw `Numerator ${value.numerator} cannot be written with dots`;
        numerator >>= 1;
        res++;
        //console.log('dotNo adding', numerator, res);
    }
    return res;
}


export function getDottedValue(value: TimeSpan, dots: number): TimeSpan {
    let { numerator, denominator } = value;
    if (numerator !== 1) throw `Numerator ${numerator} illegal argument for getDottedValue`; // todo: prepare for brevis and longa
    for (let i = 0; i < dots; i++) {
        numerator = numerator * 2 + 1;
        denominator *= 2;
    }
    return Time.newSpan(numerator, denominator);
}

export function getUndottedValue(value: TimeSpan): TimeSpan {
    if (value.denominator === 1 && value.numerator === 2) {
        return value;
    }
    const res = Time.scale(
        Time.addSpans(value, Time.newSpan(1, value.denominator)),
        1, 2
    );
    if (res.numerator !== 1) throw `Numerator ${value.numerator} illegal argument for getUndottedValue`;
    return res;
}