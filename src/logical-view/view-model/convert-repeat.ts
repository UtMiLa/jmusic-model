import { getExtendedTime, EventType } from '~/model/score/timing-order';
import { IndexedMap } from './../../tools/time-map';
import { AbsoluteTime, Time } from './../../model/rationals/time';
import { BarType, BarViewModel } from './score-view-model';
import { RepeatDef } from './../../model/score/repeats';

export interface TimedBarViewModel extends BarViewModel {
    time: AbsoluteTime;
}

export function repeatsToView(repeats: RepeatDef[]): TimedBarViewModel[] {
    const map = new IndexedMap<BarViewModel, AbsoluteTime>(Time.sortComparison, () => ({ barType: BarType.None }));

    repeats.forEach(repeat => {
        if (repeat.from.numerator > 0) {
            const item = map.get(getExtendedTime(repeat.from, EventType.Bar));
            item.repeatStart = true;
            //res.push({ barType: BarType.None, repeatStart: true, time: repeat.from });
        }
        //res.push({ barType: BarType.None, repeatEnd: true, time: repeat.to });
        const item = map.get(getExtendedTime(repeat.to, EventType.Bar));
        item.repeatEnd = true;
    });

    const res = [] as TimedBarViewModel[];
    map.forEach((index, value) => {
        const a = {... value, time: index};
        res.push(a);
    });

    return res;
}