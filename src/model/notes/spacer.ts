import { Time, TimeSpan } from './../rationals/time';

export type Spacer = Readonly<{
    duration: TimeSpan;
    type: 'spacer';
}>;

export function createSpacerFromLilypond(input: string): Spacer {
    const matcher = /^(s|(\\skip))(\d+\.*)$/i;
    const match = matcher.exec(input);
    if (!match || match.length < 2) throw 'Illegal spacer: ' + input;

    const durationString = match[3];

    return { 
        duration: Time.fromLilypond(durationString), 
        type: 'spacer' 
    };
}

export function isSpacer(spacer: any): spacer is Spacer {
    return spacer.type === 'spacer';
}