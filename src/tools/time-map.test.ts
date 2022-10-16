import { Time, AbsoluteTime } from './../model/rationals/time';
import { expect } from 'chai';
import { KeyedMap, TimeMap } from './time-map';

interface TestItem {
    text: string;
}

describe('Time map', () => {

    it('should have length 0 from the beginning', () => {
        const timeMap = new TimeMap();
        expect(timeMap).to.have.length(0);
    });

    it('should be possible to add an item', () => {
        const timeMap = new TimeMap();
        timeMap.add(Time.newAbsolute(1,1), {text: '1-1'});
        expect(timeMap).to.have.length(1);
    });

    it('should be possible to get an item by time', () => {
        const timeMap = new TimeMap<TestItem>();
        timeMap.add(Time.newAbsolute(1, 1), {text: '1-1'});
        timeMap.add(Time.newAbsolute(2, 1), {text: '2-1'});
        const res = timeMap.get(Time.newAbsolute(1,1));
        expect(res).to.deep.eq({text: '1-1'});
        const res1 = timeMap.get(Time.newAbsolute(2,1));
        expect(res1).to.deep.eq({text: '2-1'});
    });

    it('should return a new item if none exists at the time', () => {
        const timeMap = new TimeMap<TestItem>();
        timeMap.add(Time.newAbsolute(1, 1), {text: '1-1'});
        const res = timeMap.get(Time.newAbsolute(1,1));
        expect(res).to.deep.eq({text: '1-1'});
        const res1 = timeMap.get(Time.newAbsolute(2,1));
        expect(res1).to.deep.eq({});
        res1.text = '2-1';
        const res3 = timeMap.get(Time.newAbsolute(2,1));
        expect(res3).to.deep.eq({text: '2-1'});
    });

    it('should be able to clear', () => {
        const timeMap = new TimeMap<TestItem>();
        timeMap.add(Time.newAbsolute(1, 1), {text: '1-1'});
        const res1 = timeMap.get(Time.newAbsolute(2,1));
        res1.text = '2-1';

        timeMap.clear();

        const res3 = timeMap.get(Time.newAbsolute(1,1));
        expect(res3).to.deep.eq({});
        const res4 = timeMap.get(Time.newAbsolute(2,1));
        expect(res4).to.deep.eq({});
    });


    it('should be able to peek without creating', () => {
        const timeMap = new TimeMap<TestItem>();
        
        expect(timeMap.peek(Time.newAbsolute(1, 1))).to.be.undefined;

        const res1 = timeMap.get(Time.newAbsolute(1, 1));

        expect(timeMap.peek(Time.newAbsolute(1, 1))).to.eq(res1);
    });


    it('should be able to peek latest without creating', () => {
        const timeMap = new TimeMap<TestItem>();

        timeMap.add(Time.newAbsolute(2, 1), {text: '2-1'});
        timeMap.add(Time.newAbsolute(1, 1), {text: '1-1'});
        timeMap.add(Time.newAbsolute(3, 1), {text: '3-1'});

        const res1 = timeMap.peekLatest(Time.newAbsolute(9, 4));

        expect(res1).to.deep.eq({ text: '2-1' });

        expect(timeMap.peekLatest(Time.newAbsolute(1, 1))).to.deep.eq({ text: '1-1' });
        expect(timeMap.peekLatest(Time.newAbsolute(2, 1))).to.deep.eq({ text: '2-1' });
        expect(timeMap.peekLatest(Time.newAbsolute(11, 4))).to.deep.eq({ text: '2-1' });
        expect(timeMap.peekLatest(Time.newAbsolute(13, 4))).to.deep.eq({ text: '3-1' });
    });

    
    it('should be able to supply a creator function', () => {
        const timeMap = new TimeMap<TestItem>(() => ({ nodes: [], text: 'default' }));

        const res1 = timeMap.get(Time.newAbsolute(1, 1));

        expect(res1).to.deep.eq({ nodes: [], text: 'default' });
    });


        
    it('should be able to supply a creator function using time', () => {
        const timeMap = new TimeMap<TestItem>((time: AbsoluteTime) => ({ absTime: time,  nodes: [], text: 'default' }));

        const res1 = timeMap.get(Time.newAbsolute(1, 1));

        expect(res1).to.deep.eq({ absTime: Time.newAbsolute(1, 1), nodes: [], text: 'default' });
    });


});

interface TestKey {
    a: string;
    b: number;
}

function compareTestKey(tk1: TestKey, tk2: TestKey) {
    return tk1.b - tk2.b;
}

interface TestValue {
    c: string;
    d?: number;
}

describe('Keyed map', () => {
    let keyedMap: KeyedMap<TestValue, TestKey>;
    const key1 = { a: 'alfa', b: 1 };
    const key2 = { a: 'beta', b: 2 };
    const key3 = { a: 'gamma', b: 3 };

    beforeEach(() => {
        keyedMap = new KeyedMap<TestValue, TestKey>(compareTestKey);
    });

    it('should have length 0 from the beginning', () => {        
        expect(keyedMap).to.have.length(0);
    });

    it('should be possible to add an item', () => {
        keyedMap.add(key1, {c: '1-1'});
        expect(keyedMap).to.have.length(1);
    });

    it('should be possible to get an item by time', () => {
        keyedMap.add(key1, {c: '1-1'});
        keyedMap.add(key2, {c: '2-1'});
        const res = keyedMap.get(key1);
        expect(res).to.deep.eq({c: '1-1'});
        const res1 = keyedMap.get(key2);
        expect(res1).to.deep.eq({c: '2-1'});
    });

    it('should return a new item if none exists at the time', () => {
        keyedMap.add(key1, {c: '1-1'});
        const res = keyedMap.get(key1);
        expect(res).to.deep.eq({c: '1-1'});
        const res1 = keyedMap.get(key2);
        expect(res1).to.deep.eq({});
        res1.c = '2-1';
        const res3 = keyedMap.get(key2);
        expect(res3).to.deep.eq({c: '2-1'});
    });

    it('should be able to clear', () => {
        keyedMap.add(key1, {c: '1-1'});
        const res1 = keyedMap.get(key2);
        res1.c = '2-1';

        keyedMap.clear();

        const res3 = keyedMap.get(key1);
        expect(res3).to.deep.eq({});
        const res4 = keyedMap.get(key2);
        expect(res4).to.deep.eq({});
    });


    it('should be able to peek without creating', () => {
        
        expect(keyedMap.peek(key1)).to.be.undefined;

        const res1 = keyedMap.get(key1);

        expect(keyedMap.peek(key1)).to.eq(res1);
    });


    it('should be able to peek latest without creating', () => {

        keyedMap.add(key2, {c: '2-1'});
        keyedMap.add(key1, {c: '1-1'});
        keyedMap.add(key3, {c: '3-1'});

        const res1 = keyedMap.peekLatest({ a: '9-4', b: 2.25 });

        expect(res1).to.deep.eq({ c: '2-1' });

        expect(keyedMap.peekLatest(key1)).to.deep.eq({ c: '1-1' });
        expect(keyedMap.peekLatest(key2)).to.deep.eq({ c: '2-1' });
        expect(keyedMap.peekLatest({ a: '11-4', b: 2.75 })).to.deep.eq({ c: '2-1' });
        expect(keyedMap.peekLatest({ a: '13-4', b: 3.25 })).to.deep.eq({ c: '3-1' });
    });

    it('should be able to peek latest with a filter', () => {

        keyedMap.add(key2, {c: '2-1', d: 10});
        keyedMap.add(key1, {c: '1-1', d: 15});
        keyedMap.add(key3, {c: '3-1', d: 20});

        const res1 = keyedMap.peekLatest({ a: '9-4', b: 2.25 });

        expect(res1).to.deep.eq({ c: '2-1', d: 10 });

        const res2 = keyedMap.peekLatest({ a: '9-4', b: 2.25 }, (key, value: TestValue) => !!value.d && (value.d > 12));

        expect(res2).to.deep.eq({ c: '1-1', d: 15 });

    });

    
    it('should be able to supply a creator function', () => {

        const keyedMap1 = new KeyedMap<TestValue, TestKey>(compareTestKey, () => ({ c: 'default', d: 17 }));
        const res1 = keyedMap1.get(key1);

        expect(res1).to.deep.eq({ c: 'default', d: 17 });
    });


      
    it('should be able to supply a creator function using key', () => {
        const keyedMap1 = new KeyedMap<TestValue, TestKey>(compareTestKey, (key: TestKey) => ({ c: 'default' + key.a, d: 17 + key.b }));
        const res1 = keyedMap1.get(key1);

        expect(res1).to.deep.eq({ c: 'defaultalfa', d: 18 });
    });

    it('should make a filtered clone', () => {
        const keyedMap1 = new KeyedMap<TestValue, TestKey>(compareTestKey, (key: TestKey) => ({ c: 'default' + key.a, d: 17 + key.b }));

        keyedMap1.add(key2, {c: '2-1', d: -1});
        keyedMap1.add(key1, {c: '1-1', d: 1});
        keyedMap1.add(key3, {c: '3-1', d: 3});

        const clone = keyedMap1.clone((key: TestKey, value: TestValue) => !!value.d && value.d > 0);

        expect(clone).to.have.length(2);
        expect(clone.peek(key1)).to.deep.eq({c: '1-1', d: 1});
        expect(clone.peek(key2)).to.be.undefined;
        expect(clone.peek(key3)).to.deep.eq({c: '3-1', d: 3});
        expect(clone.get(key2)).to.be.deep.equal({ c: 'defaultbeta', d: 19 });
    });


});