import { Key } from './../../model/states/key';
import { createTestScore } from '../../tools/test-tools';
import { MeterFactory } from './../../model/states/meter';
import { Time } from './../../model/rationals/time';
import { expect } from 'chai';
import { createStateMap } from './state-map';

describe('State change map', () => {

    
    beforeEach(() => { 
        //
    });

    it('should create a state map from a score', () => {
        const score = createTestScore([['c\'\'1 \\meter 3/4 c\'\'2. c\'\'2.', 'c\'1 c\'2. \\key c \\minor c\'2.'], ['c1 c2. c2.']], [4, 4], [0, 0]);

        const stateMap = createStateMap(score);

        expect(stateMap.length).to.eq(2);
        expect(stateMap.items[0].index).to.deep.eq({ absTime: Time.newAbsolute(1, 1), scope: undefined });
        expect(stateMap.items[0].value).to.deep.eq({ meter: MeterFactory.createRegularMeter({  count: 3, value: 4 })});

        expect(stateMap.items[1].index).to.deep.eq({ absTime: Time.newAbsolute(7, 4), scope: undefined });
        expect(stateMap.items[1].value).to.deep.eq({ key: new Key({ count: 3, accidental: -1 })});
    });



});    
