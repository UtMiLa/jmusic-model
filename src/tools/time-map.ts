import { AbsoluteTime, Time } from './../model/rationals/time';


export class KeyedMap<T, Key> {

    constructor(private compareKey: (key1: Key, key2: Key) => number, private creator?: (time: Key) => T) {}

    items: { key: Key, value: T }[] = [];

    get length(): number {
        return this.items.length;
    }

    add(time: Key, item: T): void {
        this.items.push({ key: time, value: item });
    }

    peek(time: Key): T | undefined {
        const res = this.items.filter(it => this.compareKey(time, it.key) === 0).map(it => it.value);
        if (res.length) return res[0];
        
        return undefined;
    }

    peekLatest(key: Key, filter: (key: Key, value: T) => boolean = () => true): T | undefined {
        const beforeTime = this.items
            .filter(it => filter(it.key, it.value))
            .filter(it => this.compareKey(key, it.key) >= 0)
            .sort((a,b) => this.compareKey(a.key, b.key));
        if (!beforeTime.length) return undefined;

        return beforeTime[beforeTime.length - 1].value;
    }

    get(key: Key): T {
        const r1 = this.peek(key);
        if (r1) return r1;
        const result = this.creator ? this.creator(key) : {} as T;
        this.add(key, result);
        return result;
    }

    clear(): void {
        this.items = [];
    }

    clone(filter: (key: Key, value: T) => boolean): KeyedMap<T, Key> {
        const res = new KeyedMap<T, Key>(this.compareKey, this.creator);
        res.items = this.items.filter(item => filter(item.key, item.value));
        return res;
    }

    forEach(callBack: (key: Key, value: T) => void): void {
        this.items.forEach(item => callBack(item.key, item.value));
    }
}


export class TimeMap<T> extends KeyedMap<T, AbsoluteTime> {
    constructor(creator?: (time: AbsoluteTime) => T) {
        super(Time.sortComparison, creator);
    }
}