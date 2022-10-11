import { AbsoluteTime, Time } from './../model/rationals/time';
export class TimeMap<T> {
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

    get(time: AbsoluteTime): T {
        /*const res = this.items.filter(it => Time.sortComparison(time, it.absTime) === 0).map(it => it.item);
        if (res.length) return res[0];*/
        const r1 = this.peek(time);
        if (r1) return r1;
        const result = {} as T;
        this.add(time, result);
        return result;
    }
    clear(): void {
        this.items = [];
    }
}