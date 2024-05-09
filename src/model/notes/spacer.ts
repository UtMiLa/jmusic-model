import { Time, TimeSpan } from './../rationals/time';

export type Spacer = Readonly<{
    duration: TimeSpan;
    type: 'spacer';
}>;

export function createSpacerFromLilypond(input: string): Spacer {
    const matcher = /^(s|(\\skip))(\d+\.*)(\*(\d+)\/(\d+))?$/i;
    const match = matcher.exec(input);
    if (!match || match.length < 2) throw 'Illegal spacer: ' + input;

    const durationString = match[3];
    let time = Time.fromLilypond(durationString);

    if (match.length === 7 && match[5] && match[6]) {
        time = Time.scale(time, parseInt(match[5]), parseInt(match[6]));
    }

    return { 
        duration: time, 
        type: 'spacer' 
    };
}

export function spacerAsLilypond(input: Spacer): string {
    return `s1*${input.duration.numerator}/${input.duration.denominator}`;
}

export function isSpacer(spacer: any): spacer is Spacer {
    return spacer.type === 'spacer';
}