import { AbsoluteTime, Time } from './../model/rationals/time';
export class TimeMap<T> {

    constructor(private creator?: (time: AbsoluteTime) => T) {}

    items: { absTime: AbsoluteTime, item: T }[] = [];

    get length(): number {
        return this.items.length;
    }

    add(time: AbsoluteTime, item: T): void {
        this.items.push({ absTime: time, item });
    }

    peek(time: AbsoluteTime): T | undefined {
        const res = this.items.filter(it => Time.sortComparison(time, it.absTime) === 0).map(it => it.item);
        if (res.length) return res[0];
        
        return undefined;
    }

    peekLatest(time: AbsoluteTime): T | undefined {
        const beforeTime = this.items.filter(it => Time.sortComparison(time, it.absTime) >= 0).sort((a,b) => Time.sortComparison(a.absTime, b.absTime));
        if (!beforeTime.length) return undefined;

        return beforeTime[beforeTime.length - 1].item;
    }

    get(time: AbsoluteTime): T {
        const r1 = this.peek(time);
        if (r1) return r1;
        const result = this.creator ? this.creator(time) : {} as T;
        this.add(time, result);
        return result;
    }

    clear(): void {
        this.items = [];
    }
}