import { Time, TimeSpan } from './../rationals/time';
export enum LongDecorationType {
    Crescendo,
    Decrescendo,
    Slur
}

export interface LongDecorationElement {
    longDeco: LongDecorationType;
    length: TimeSpan;
}