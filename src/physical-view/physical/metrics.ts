/* eslint-disable @typescript-eslint/no-inferrable-types */
export interface Metrics {
    staffLineWidth: number; 
    staffLengthOffset: number;

    blackNoteHeadLeftXOffset: number;
    blackNoteHeadRightXOffset: number;
    halfNoteHeadLeftXOffset: number;
    halfNoteHeadRightXOffset: number;

    quarterStemDefaultLength: number;

    defaultSpacing: number;
    afterBarSpacing: number;

    keySigSpacing: number;

    meterNumberSpacing: number;
    meterAdjustY: number;

    dotToNoteDist: number;
    dotToDotDist: number;

    ledgerLineExtra: number;
    ledgerLineLength: number;
}

export class StandardMetrics implements Metrics {
    constructor(seed: {[key: string]: number} = {}) {
        Object.keys(seed).forEach(key => {
            (this as unknown as {[key: string]: number})[key] = seed[key];
        });
    }

    staffLineWidth: number = 10; 
    staffLengthOffset: number = 10;

    blackNoteHeadLeftXOffset = 6.5;
    blackNoteHeadRightXOffset = 0;
    halfNoteHeadLeftXOffset = 7;
    halfNoteHeadRightXOffset = 0.5;

    quarterStemDefaultLength = 25;

    defaultSpacing = 20;
    afterBarSpacing = 8;

    keySigSpacing = 6;

    meterNumberSpacing = 7;
    meterAdjustY = 1;

    dotToNoteDist = 10;
    dotToDotDist = 4;

    ledgerLineExtra = 4;
    ledgerLineLength = 15;
}