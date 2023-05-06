import { AbsoluteTime, Time, TimeSpan } from './time';
import { expect } from 'chai';
import { Rational, RationalDef } from '../../model/rationals/rational';
import { getDotNumber, getDottedValue, getUndottedValue } from './dots';

describe('Dotted values', ()=> {
    it('should return number of dots from value', () => {
        expect(getDotNumber(Time.newSpan(1, 4))).to.eq(0);
        expect(getDotNumber(Time.newSpan(3, 4))).to.eq(1);
        expect(getDotNumber(Time.newSpan(7, 8))).to.eq(2);
        expect(getDotNumber(Time.newSpan(15, 16))).to.eq(3);
        expect(() => getDotNumber(Time.newSpan(5, 4))).to.throw(/Numerator 5 cannot be written with dots/);
    });

    it('should return total time from undotted time and number of dots', () => {
        expect(getDottedValue(Time.newSpan(1, 4), 0)).to.deep.eq(Time.newSpan(1, 4));
        expect(getDottedValue(Time.newSpan(1, 4), 1)).to.deep.eq(Time.newSpan(3, 8));
        expect(getDottedValue(Time.newSpan(1, 4), 2)).to.deep.eq(Time.newSpan(7, 16));
        expect(getDottedValue(Time.newSpan(1, 4), 3)).to.deep.eq(Time.newSpan(15, 32));
        expect(() => getDottedValue(Time.newSpan(5, 4), 1)).to.throw();
    });

    it('should return total time from undotted time and number of dots', () => {
        expect(getUndottedValue(Time.newSpan(1, 4))).to.deep.eq(Time.newSpan(1, 4));
        expect(getUndottedValue(Time.newSpan(3, 8))).to.deep.eq(Time.newSpan(1, 4));
        expect(getUndottedValue(Time.newSpan(7, 4))).to.deep.eq(Time.newSpan(1, 1));
        expect(getUndottedValue(Time.newSpan(15, 16))).to.deep.eq(Time.newSpan(1, 2));
        expect(() => getUndottedValue(Time.newSpan(5, 4))).to.throw();
    });

});