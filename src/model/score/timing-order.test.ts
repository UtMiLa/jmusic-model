import { expect } from 'chai';
import { AbsoluteTime, Time } from './../rationals/time';
import { EventType, getExtendedTime } from './timing-order';

describe('Internal order inside an absolute time', () => {
    let time1: AbsoluteTime;

    beforeEach(() => {
        time1 = Time.newAbsolute(5, 8);
    });

    it('should order simultaneous notes as equal', () => {
        const eTime1 = getExtendedTime(time1, EventType.Note);
        const eTime2 = getExtendedTime(time1, EventType.Note);

        expect(Time.sortComparison(eTime1, eTime2)).to.eq(0);
    });

    it('should order a bar line before a note', () => {
        const eTime1 = getExtendedTime(time1, EventType.Note);
        const eTime2 = getExtendedTime(time1, EventType.Bar);

        expect(Time.sortComparison(eTime1, eTime2)).to.be.greaterThan(0);
    });

    it('should order a state change like a bar line', () => {
        const eTime1 = getExtendedTime(time1, EventType.KeyChg);
        const eTime2 = getExtendedTime(time1, EventType.Bar);
        const eTime3 = getExtendedTime(time1, EventType.MeterChg);
        const eTime4 = getExtendedTime(time1, EventType.ClefChg);

        expect(Time.sortComparison(eTime1, eTime2)).to.eq(0);
        expect(Time.sortComparison(eTime3, eTime2)).to.eq(0);
        expect(Time.sortComparison(eTime4, eTime2)).to.eq(0);
    });

    it('should order an expression like a note', () => {
        const eTime1 = getExtendedTime(time1, EventType.Note);
        const eTime2 = getExtendedTime(time1, EventType.Lyric);
        const eTime3 = getExtendedTime(time1, EventType.Expression);

        expect(Time.sortComparison(eTime1, eTime2)).to.eq(0);
        expect(Time.sortComparison(eTime3, eTime1)).to.eq(0);
    });
    it('should order grace notes [before a beat] between bar line and note', () => {
        const eTime1 = getExtendedTime(time1, EventType.Note);
        const eTime2 = getExtendedTime(time1, EventType.GraceNote);
        const eTime3 = getExtendedTime(time1, EventType.Bar);

        expect(Time.sortComparison(eTime1, eTime2)).to.be.greaterThan(0);
        expect(Time.sortComparison(eTime3, eTime2)).to.be.lessThan(0);
    });

    it('should order grace notes [after a beat] before the bar line', () => {
        const eTime1 = getExtendedTime(time1, EventType.Note);
        const eTime2 = getExtendedTime(time1, EventType.GraceNoteAfter);
        const eTime3 = getExtendedTime(time1, EventType.Bar);

        expect(Time.sortComparison(eTime1, eTime2)).to.be.greaterThan(0);
        expect(Time.sortComparison(eTime3, eTime2)).to.be.greaterThan(0);
    });

    it('should order a group of grace notes correctly', () => {
        const eTime1 = getExtendedTime(time1, EventType.GraceNote, 0);
        const eTime2 = getExtendedTime(time1, EventType.GraceNote, 1);
        const eTime3 = getExtendedTime(time1, EventType.GraceNote, 2);

        expect(Time.sortComparison(eTime1, eTime2)).to.be.lessThan(0);
        expect(Time.sortComparison(eTime2, eTime3)).to.be.lessThan(0);
    });

    it('should order a grace notes with a high index correctly', () => {
        const eTime1 = getExtendedTime(time1, EventType.GraceNote, 1000);
        const eTime2 = getExtendedTime(time1, EventType.Note);
        const eTime3 = getExtendedTime(time1, EventType.Bar);
        const eTime4 = getExtendedTime(time1, EventType.GraceNoteAfter, 1000);

        expect(Time.sortComparison(eTime1, eTime2)).to.be.lessThan(0);
        expect(Time.sortComparison(eTime1, eTime3)).to.be.greaterThan(0);
        expect(Time.sortComparison(eTime4, eTime2)).to.be.lessThan(0);
        expect(Time.sortComparison(eTime4, eTime3)).to.be.lessThan(0);
    });
});