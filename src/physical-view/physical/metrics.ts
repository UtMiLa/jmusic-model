/* eslint-disable @typescript-eslint/no-inferrable-types */
export interface Metrics {
    brokenBeamLength: number;
    leftMargin: number;
    tieAfterNote: number;
    scaleDegreeUnit: number; 
    beamSpacing: number;
    tupletSpacing: number;
    tupletBracketHeight: number;
    staffLengthOffset: number;
    staffBottomMargin: number;
    staffTopMargin: number;

    blackNoteHeadLeftXOffset: number;
    blackNoteHeadRightXOffset: number;
    halfNoteHeadLeftXOffset: number;
    halfNoteHeadRightXOffset: number;

    quarterStemDefaultLength: number;

    graceScale: number;

    defaultSpacing: number;
    graceNoteSpacing: number;
    afterBarSpacing: number;
    beforeRepeatSpacing: number;
    afterRepeatSpacing: number;
    repeatEndOffset: number;

    keySigSpacing: number;

    meterNumberSpacing: number;
    meterAdjustY: number;

    dotToNoteDist: number;
    dotToDotDist: number;

    ledgerLineExtra: number;
    ledgerLineLength: number;

    accidentalSpacing: number;
    accidentalDisplacement: number;

    noteExpressionOffset: number;
    noteExpressionSpacing: number;

    lyricsVerse1Y: number;
    lyricsVerseSpacing: number;
    lyricsFont: string;
    lyricsFontSize: number;

    dynamicY: number;

    clefTransposeScale: number;
    clefTransposeXOffset: number;
    clefTransposeXSpacing: number;
    clefTransposeYOffsetUnder: number;
    clefTransposeYOffsetOver: number;
}

export class StandardMetrics implements Metrics {
    constructor(seed: {[key: string]: number} = {}) {
        Object.keys(seed).forEach(key => {
            (this as unknown as {[key: string]: number})[key] = seed[key];
        });
    }
    brokenBeamLength = 6;
    leftMargin = 10;
    tieAfterNote: number = 9;

    scaleDegreeUnit = 3;
    beamSpacing: number = 5;
    tupletSpacing = -10; 
    tupletBracketHeight = 5; 
    staffLengthOffset: number = 10;
    staffBottomMargin = 30;
    staffTopMargin = 30;

    blackNoteHeadLeftXOffset = 6.5;
    blackNoteHeadRightXOffset = 0;
    halfNoteHeadLeftXOffset = 7;
    halfNoteHeadRightXOffset = 0.5;

    quarterStemDefaultLength = 18;

    graceScale = 0.6;

    defaultSpacing = 20;
    graceNoteSpacing = 12;
    afterBarSpacing = 8;
    beforeRepeatSpacing = 8;
    afterRepeatSpacing = 8;
    repeatEndOffset = 5;

    keySigSpacing = 6;

    meterNumberSpacing = 7;
    meterAdjustY = 1;

    dotToNoteDist = 10;
    dotToDotDist = 4;

    ledgerLineExtra = 4;
    ledgerLineLength = 15;

    accidentalSpacing = 9;
    accidentalDisplacement = 8

    noteExpressionOffset = 5;
    noteExpressionSpacing = 5;

    lyricsVerse1Y = 30;
    lyricsVerseSpacing = 12;
    lyricsFont = 'Sans';
    lyricsFontSize = 11;

    dynamicY = -20;
    
    clefTransposeScale = 0.6;
    clefTransposeXOffset = 3;
    clefTransposeXSpacing = 2;
    clefTransposeYOffsetUnder = -6;
    clefTransposeYOffsetOver = 6;
}