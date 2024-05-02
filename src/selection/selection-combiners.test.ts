import { Model } from './../model/model';
import { JMusic } from './../model/facade/jmusic';
import { Time } from './../model/rationals/time';
import { expect } from 'chai';
import { SelectionAll, SelectionVoiceTime } from './query';
import { createTestScore } from '../tools/test-tools';
import { ElementIdentifier, Selection } from './selection-types';
import { selectDifference, selectIntersect, selectUnion } from './selection-combiners';


describe('Selection combiners', () => {

    const sel1: Selection = {
        isSelected: (element: ElementIdentifier) => element.elementNo > 10
    };
    const sel2: Selection = {
        isSelected: (element: ElementIdentifier) => element.voiceNo === 1
    };
    /*const sel3: Selection = {
        isSelected: (element: ElementIdentifier) => element.staffNo > 2
    };*/

    it('should union two selections', () => {
        const selUnion = selectUnion(sel1, sel2);

        expect(selUnion.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 500 })).to.be.true;        
        expect(selUnion.isSelected({ elementNo: -9999, staffNo: -8, voiceNo: 1 })).to.be.true;        
        expect(selUnion.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 1 })).to.be.true;        
        expect(selUnion.isSelected({ elementNo: -9999, staffNo: -8, voiceNo: 500 })).to.be.false;
    });

    it('should intersect two selections', () => {
        const selUnion = selectIntersect(sel1, sel2);

        expect(selUnion.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 500 })).to.be.false;        
        expect(selUnion.isSelected({ elementNo: -9999, staffNo: -8, voiceNo: 1 })).to.be.false;        
        expect(selUnion.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 1 })).to.be.true;        
        expect(selUnion.isSelected({ elementNo: -9999, staffNo: -8, voiceNo: 500 })).to.be.false;
    });

    it('should take difference of two selections', () => {
        const selUnion = selectDifference(sel1, sel2);

        expect(selUnion.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 500 })).to.be.true;
        expect(selUnion.isSelected({ elementNo: -9999, staffNo: -8, voiceNo: 1 })).to.be.false;
        expect(selUnion.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 1 })).to.be.false;
        expect(selUnion.isSelected({ elementNo: -9999, staffNo: -8, voiceNo: 500 })).to.be.false;
    });

});