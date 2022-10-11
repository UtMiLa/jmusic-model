import { Time, AbsoluteTime } from './../model/rationals/time';
import { expect } from 'chai';
import { TimeMap } from './time-map';

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