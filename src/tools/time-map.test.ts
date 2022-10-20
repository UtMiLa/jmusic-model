import { Time, AbsoluteTime } from './../model/rationals/time';
import { expect } from 'chai';
import { IndexedMap, TimeMap } from './time-map';

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

interface TestIndex {
    a: string;
    b: number;
}

function compareTestIndex(tk1: TestIndex, tk2: TestIndex) {
    return tk1.b - tk2.b;
}

interface TestValue {
    c: string;
    d?: number;
}

describe('Indexed map', () => {
    let indexedMap: IndexedMap<TestValue, TestIndex>;
    const index1 = { a: 'alfa', b: 1 };
    const index2 = { a: 'beta', b: 2 };
    const index3 = { a: 'gamma', b: 3 };

    beforeEach(() => {
        indexedMap = new IndexedMap<TestValue, TestIndex>(compareTestIndex);
    });

    it('should have length 0 from the beginning', () => {        
        expect(indexedMap).to.have.length(0);
    });

    it('should be possible to add an item', () => {
        indexedMap.add(index1, {c: '1-1'});
        expect(indexedMap).to.have.length(1);
    });

    it('should be possible to get an item by time', () => {
        indexedMap.add(index1, {c: '1-1'});
        indexedMap.add(index2, {c: '2-1'});
        const res = indexedMap.get(index1);
        expect(res).to.deep.eq({c: '1-1'});
        const res1 = indexedMap.get(index2);
        expect(res1).to.deep.eq({c: '2-1'});
    });

    it('should return a new item if none exists at the time', () => {
        indexedMap.add(index1, {c: '1-1'});
        const res = indexedMap.get(index1);
        expect(res).to.deep.eq({c: '1-1'});
        const res1 = indexedMap.get(index2);
        expect(res1).to.deep.eq({});
        res1.c = '2-1';
        const res3 = indexedMap.get(index2);
        expect(res3).to.deep.eq({c: '2-1'});
    });

    it('should be able to clear', () => {
        indexedMap.add(index1, {c: '1-1'});
        const res1 = indexedMap.get(index2);
        res1.c = '2-1';

        indexedMap.clear();

        const res3 = indexedMap.get(index1);
        expect(res3).to.deep.eq({});
        const res4 = indexedMap.get(index2);
        expect(res4).to.deep.eq({});
    });


    it('should be able to peek without creating', () => {
        
        expect(indexedMap.peek(index1)).to.be.undefined;

        const res1 = indexedMap.get(index1);

        expect(indexedMap.peek(index1)).to.eq(res1);
    });


    it('should be able to peek latest without creating', () => {

        indexedMap.add(index2, {c: '2-1'});
        indexedMap.add(index1, {c: '1-1'});
        indexedMap.add(index3, {c: '3-1'});

        const res1 = indexedMap.peekLatest({ a: '9-4', b: 2.25 });

        expect(res1).to.deep.eq({ c: '2-1' });

        expect(indexedMap.peekLatest(index1)).to.deep.eq({ c: '1-1' });
        expect(indexedMap.peekLatest(index2)).to.deep.eq({ c: '2-1' });
        expect(indexedMap.peekLatest({ a: '11-4', b: 2.75 })).to.deep.eq({ c: '2-1' });
        expect(indexedMap.peekLatest({ a: '13-4', b: 3.25 })).to.deep.eq({ c: '3-1' });
    });

    it('should be able to peek latest with a filter', () => {

        indexedMap.add(index2, {c: '2-1', d: 10});
        indexedMap.add(index1, {c: '1-1', d: 15});
        indexedMap.add(index3, {c: '3-1', d: 20});

        const res1 = indexedMap.peekLatest({ a: '9-4', b: 2.25 });

        expect(res1).to.deep.eq({ c: '2-1', d: 10 });

        const res2 = indexedMap.peekLatest({ a: '9-4', b: 2.25 }, (index, value: TestValue) => !!value.d && (value.d > 12));

        expect(res2).to.deep.eq({ c: '1-1', d: 15 });

    });

    
    it('should be able to supply a creator function', () => {

        const indexedMap1 = new IndexedMap<TestValue, TestIndex>(compareTestIndex, () => ({ c: 'default', d: 17 }));
        const res1 = indexedMap1.get(index1);

        expect(res1).to.deep.eq({ c: 'default', d: 17 });
    });


      
    it('should be able to supply a creator function using index', () => {
        const indexedMap1 = new IndexedMap<TestValue, TestIndex>(compareTestIndex, (index: TestIndex) => ({ c: 'default' + index.a, d: 17 + index.b }));
        const res1 = indexedMap1.get(index1);

        expect(res1).to.deep.eq({ c: 'defaultalfa', d: 18 });
    });

    it('should make a filtered clone', () => {
        const indexedMap1 = new IndexedMap<TestValue, TestIndex>(compareTestIndex, (index: TestIndex) => ({ c: 'default' + index.a, d: 17 + index.b }));

        indexedMap1.add(index2, {c: '2-1', d: -1});
        indexedMap1.add(index1, {c: '1-1', d: 1});
        indexedMap1.add(index3, {c: '3-1', d: 3});

        const clone = indexedMap1.clone((index: TestIndex, value: TestValue) => !!value.d && value.d > 0);

        expect(clone).to.have.length(2);
        expect(clone.peek(index1)).to.deep.eq({c: '1-1', d: 1});
        expect(clone.peek(index2)).to.be.undefined;
        expect(clone.peek(index3)).to.deep.eq({c: '3-1', d: 3});
        expect(clone.get(index2)).to.be.deep.equal({ c: 'defaultbeta', d: 19 });
    });


});