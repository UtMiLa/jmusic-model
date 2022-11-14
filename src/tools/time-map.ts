import { AbsoluteTime, Time } from './../model/rationals/time';


export class IndexedMap<T, Index> {
    constructor(private compareIndex: (index1: Index, index2: Index) => number, private creator?: (time: Index) => T) {}

    items: { index: Index, value: T }[] = [];

    get length(): number {
        return this.items.length;
    }

    add(time: Index, item: T): void {
        this.items.push({ index: time, value: item });
    }

    peek(time: Index): T | undefined {
        const res = this.items.filter(it => this.compareIndex(time, it.index) === 0).map(it => it.value);
        if (res.length) return res[0];
        
        return undefined;
    }

    peekLatest(index: Index, filter: (index: Index, value: T) => boolean = () => true): T | undefined {
        const beforeTime = this.items
            .filter(it => filter(it.index, it.value))
            .filter(it => this.compareIndex(index, it.index) >= 0)
            .sort((a,b) => this.compareIndex(a.index, b.index));
        if (!beforeTime.length) return undefined;

        return beforeTime[beforeTime.length - 1].value;
    }

    get(index: Index): T {
        const r1 = this.peek(index);
        if (r1) return r1;
        const result = this.creator ? this.creator(index) : {} as T;
        this.add(index, result);
        return result;
    }

    clear(): void {
        this.items = [];
    }

    clone(filter: (index: Index, value: T) => boolean): IndexedMap<T, Index> {
        const res = new IndexedMap<T, Index>(this.compareIndex, this.creator);
        res.items = this.items.filter(item => filter(item.index, item.value));
        return res;
    }

    forEach(callBack: (index: Index, value: T) => void): void {
        this.items.forEach(item => callBack(item.index, item.value));
    }

    filter(func: (index: Index, value: T) => boolean): IndexedMap<T, Index> {
        const res = new IndexedMap<T, Index>(this.compareIndex, this.creator);
        res.items = this.items.filter(item => func(item.index, item.value));
        return res;
    }


}


export class TimeMap<T> extends IndexedMap<T, AbsoluteTime> {
    constructor(creator?: (time: AbsoluteTime) => T) {
        super(Time.sortComparison, creator);
    }
}