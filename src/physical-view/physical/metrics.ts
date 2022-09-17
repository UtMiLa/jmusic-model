/* eslint-disable @typescript-eslint/no-inferrable-types */
export interface Metrics {
    staffLineWidth: number; 
    staffLengthOffset: number;

    blackNoteHeadLeftXOffset: number;
    blackNoteHeadRighttXOffset: number;
    halfNoteHeadLeftXOffset: number;
    halfNoteHeadRighttXOffset: number;

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

    blackNoteHeadLeftXOffset = 7;
    blackNoteHeadRighttXOffset = 0;
    halfNoteHeadLeftXOffset = 7;
    halfNoteHeadRighttXOffset = 0;

    quarterStemDefaultLength = 25;

}