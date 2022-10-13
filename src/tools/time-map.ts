import { AbsoluteTime, Time } from './../model/rationals/time';


export class KeyedMap<T, Key> {

    constructor(private compareKey: (key1: Key, key2: Key) => number, private creator?: (time: Key) => T) {}

    items: { absTime: Key, item: T }[] = [];

    get length(): number {
        return this.items.length;
    }

    add(time: Key, item: T): void {
        this.items.push({ absTime: time, item });
    }

    peek(time: Key): T | undefined {
        const res = this.items.filter(it => this.compareKey(time, it.absTime) === 0).map(it => it.item);
        if (res.length) return res[0];
        
        return undefined;
    }

    peekLatest(time: Key): T | undefined {
        const beforeTime = this.items.filter(it => this.compareKey(time, it.absTime) >= 0).sort((a,b) => this.compareKey(a.absTime, b.absTime));
        if (!beforeTime.length) return undefined;

        return beforeTime[beforeTime.length - 1].item;
    }

    get(time: Key): T {
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


export class TimeMap<T> extends KeyedMap<T, AbsoluteTime> {
    constructor(creator?: (time: AbsoluteTime) => T) {
        super(Time.sortComparison, creator);
    }
}