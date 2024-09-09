import { Time, AbsoluteTime } from './../model/rationals/time';
import { expect } from 'chai';
import { IndexedMap, TimeMap } from './time-map';
import { ignoreIfEmpty, ignoreIfUndefined } from './ignore-if-undefined';


describe('Ignore if empty', () => {
    it('should ignore if undefined', () => {
        const val = {a: 'a',...ignoreIfEmpty('test', undefined)};
        expect(val).to.deep.eq({ a: 'a' });
    });

    it('should ignore if empty', () => {
        const val = {a: 'a',...ignoreIfEmpty('test', [])};
        expect(val).to.deep.eq({ a: 'a' });
    });

    it('should use if not empty', () => {
        const val = {a: 'a',...ignoreIfEmpty('test', ['value1', 'value2'])};
        expect(val).to.deep.eq({ a: 'a', test: ['value1', 'value2'] });
    });

});

describe('Ignore if undefined', () => {
    it('should ignore if undefined', () => {
        const val = {a: 'a',...ignoreIfUndefined('test', undefined)};
        expect(val).to.deep.eq({ a: 'a' });
    });

    it('should not ignore if empty', () => {
        const val = {a: 'a',...ignoreIfUndefined('test', [])};
        expect(val).to.deep.eq({ a: 'a', test: [] });
    });

    it('should use if not empty', () => {
        const val = {a: 'a',...ignoreIfUndefined('test', ['value1', 'value2'])};
        expect(val).to.deep.eq({ a: 'a', test: ['value1', 'value2'] });
    });

});
