import { JMusic } from './../../model/facade/jmusic';
import { Clef } from './../../model/states/clef';
import { Key } from './../../model/states/key';
import { MeterFactory } from './../../model/states/meter';
import { Time } from './../../model/rationals/time';
import { expect } from 'chai';
import { createStateMap, getStateAt } from './state-map';

describe('State change map', () => {

    
    beforeEach(() => { 
        //
    });

    it('should create a state map from a score', () => {
        const score = new JMusic({ content: [['c\'\'1 \\meter 3/4 c\'\'2. c\'\'2.', 'c\'1 c\'2. \\key c \\minor c\'2.'], ['c1 \\clef tenor c2. c2.']] });

        const stateMap = createStateMap(score);

        expect(stateMap.length).to.eq(3);
        expect(stateMap.items[0].index).to.deep.eq({ absTime: Time.newAbsolute(1, 1), scope: undefined });
        expect(stateMap.items[0].value).to.deep.eq({ meter: MeterFactory.createRegularMeter({  count: 3, value: 4 })});

        expect(stateMap.items[1].index).to.deep.eq({ absTime: Time.newAbsolute(1, 1), scope: 1 });
        expect(stateMap.items[1].value).to.deep.eq({ clef: Clef.clefTenorC });

        expect(stateMap.items[2].index).to.deep.eq({ absTime: Time.newAbsolute(7, 4), scope: undefined });
        expect(stateMap.items[2].value).to.deep.eq({ key: new Key({ count: 3, accidental: -1 })});
    });


    it('should get state from a state map', () => {
        const score = new JMusic({ content: [['c\'\'1 \\meter 3/4 c\'\'2. c\'\'2.', 'c\'1 c\'2. \\key c \\minor c\'2.'], ['c1 \\clef tenor c2. c2.']] });

        const stateMap = createStateMap(score);

        const state1 = getStateAt(stateMap, Time.newAbsolute(1, 4), 0);
        expect(state1).to.deep.include({ meter: undefined, key: undefined, clef: undefined });

        const state2 = getStateAt(stateMap, Time.newAbsolute(4, 4), 0);
        expect(state2).to.deep.include({ meter: MeterFactory.createRegularMeter({count: 3, value: 4}), key: undefined, clef: undefined });
        const state3 = getStateAt(stateMap, Time.newAbsolute(4, 4), 1);
        expect(state3).to.deep.include({ meter: MeterFactory.createRegularMeter({count: 3, value: 4}), key: undefined, clef: Clef.clefTenorC });

        const state4 = getStateAt(stateMap, Time.newAbsolute(8, 4), 0);
        expect(state4).to.deep.include({ meter: MeterFactory.createRegularMeter({count: 3, value: 4}), key: new Key({accidental: -1, count: 3}), clef: undefined });
        const state5 = getStateAt(stateMap, Time.newAbsolute(8, 4), 1);
        expect(state5).to.deep.include({ meter: MeterFactory.createRegularMeter({count: 3, value: 4}), key: new Key({accidental: -1, count: 3}), clef: Clef.clefTenorC });

    });




});    
