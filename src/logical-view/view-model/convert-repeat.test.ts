import { EventType, getExtendedTime } from '../../model/score/timing-order';
import { BarType } from './score-view-model';
import { Time } from './../../model/rationals/time';
import { RepeatDef } from './../../model/score/repeats';
import { expect } from 'chai';
import { repeatsToView } from './convert-repeat';

describe('View model: Repeats', () => {

    it('should convert a repeat (from start time) to view model', () => {
        const repeats = [{ from: Time.StartTime, to: Time.newAbsolute(5, 1) } as RepeatDef];

        const answer = repeatsToView(repeats);

        expect(answer).to.have.length(1);
        expect(answer[0].repeatEnd).to.be.true;
        expect(answer[0]).to.deep.eq({ barType: BarType.None, repeatEnd: true, time: getExtendedTime(Time.newAbsolute(5, 1), EventType.Bar) });
    });


    it('should convert a repeat (from later than start time) to view model', () => {
        const repeats = [{ from: Time.newAbsolute(2, 1), to: Time.newAbsolute(6, 1) } as RepeatDef];

        const answer = repeatsToView(repeats);

        expect(answer).to.have.length(2);
        expect(answer[0]).to.deep.eq({ barType: BarType.None, repeatStart: true, time: getExtendedTime(Time.newAbsolute(2, 1), EventType.Bar) });
        expect(answer[1]).to.deep.eq({ barType: BarType.None, repeatEnd: true, time: getExtendedTime(Time.newAbsolute(6, 1), EventType.Bar) });
    });

    
    it('should convert two repeats (not consecutive) to view model', () => {
        const repeats = [
            { from: Time.StartTime, to: Time.newAbsolute(2, 1) } as RepeatDef,
            { from: Time.newAbsolute(5, 1), to: Time.newAbsolute(6, 1) } as RepeatDef
        ];

        const answer = repeatsToView(repeats);

        expect(answer).to.have.length(3);
        expect(answer[0]).to.deep.eq({ barType: BarType.None, repeatEnd: true, time: getExtendedTime(Time.newAbsolute(2, 1), EventType.Bar) });
        expect(answer[1]).to.deep.eq({ barType: BarType.None, repeatStart: true, time: getExtendedTime(Time.newAbsolute(5, 1), EventType.Bar) });
        expect(answer[2]).to.deep.eq({ barType: BarType.None, repeatEnd: true, time: getExtendedTime(Time.newAbsolute(6, 1), EventType.Bar) });
    });


    
    it('should convert two repeats (consecutive) to view model', () => {
        const repeats = [
            { from: Time.StartTime, to: Time.newAbsolute(5, 1) } as RepeatDef,
            { from: Time.newAbsolute(5, 1), to: Time.newAbsolute(6, 1) } as RepeatDef
        ];

        const answer = repeatsToView(repeats);

        expect(answer).to.have.length(2);
        expect(answer[0]).to.deep.eq({ barType: BarType.None, repeatStart: true, repeatEnd: true, time: getExtendedTime(Time.newAbsolute(5, 1), EventType.Bar) });
        expect(answer[1]).to.deep.eq({ barType: BarType.None, repeatEnd: true, time: getExtendedTime(Time.newAbsolute(6, 1), EventType.Bar) });
    });


});

