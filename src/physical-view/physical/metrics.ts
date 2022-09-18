/* eslint-disable @typescript-eslint/no-inferrable-types */
export interface Metrics {
    staffLineWidth: number; 
    staffLengthOffset: number;

    blackNoteHeadLeftXOffset: number;
    blackNoteHeadRighttXOffset: number;
    halfNoteHeadLeftXOffset: number;
    halfNoteHeadRightXOffset: number;

    quarterStemDefaultLength: number;
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
    blackNoteHeadRighttXOffset = 0;
    halfNoteHeadLeftXOffset = 7;
    halfNoteHeadRightXOffset = 0.5;

    quarterStemDefaultLength = 25;

}