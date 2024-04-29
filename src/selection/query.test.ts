import { expect } from 'chai';
import { SelectionAll } from './query';


describe('Queries', () => {
    it('SelectionAll should select all elements', () => {
        const select = new SelectionAll();

        expect(select.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 500 })).to.be.true;
    });
});