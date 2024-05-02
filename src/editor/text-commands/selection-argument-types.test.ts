import { SelectionVoiceTime } from './../../selection/query';
import { Rational } from './../../model/rationals/rational';
import { expect } from 'chai';
import { either } from 'fp-ts';
import { SelectionVoiceTimeArg, ToEndTimeRestrictionArg } from './selection-argument-types';
import { JMusic, Time } from '../../model';
import { InsertionPoint } from '../insertion-point';

describe('Selection argument types', () => {
    it('should match current to end', () => {
        const parsed = ToEndTimeRestrictionArg('to end');
        if (!either.isRight(parsed)) throw 'Fail';
        const value = parsed.right;
        expect(value).to.deep.eq([['this', Time.EternityTime], '']);
    });

    it('should match current to end', () => {
        const parsed = SelectionVoiceTimeArg('voice this to end');
        if (!either.isRight(parsed)) throw 'Fail';
        const value = parsed.right;
        const model = new JMusic('c4');
        const ins = new InsertionPoint(model);
        ins.moveToTime(Time.newAbsolute(3, 4));
        ins.moveToVoice(3, 2);
        expect(value[0](model, ins)).to.deep.eq(new SelectionVoiceTime(model, 3, 2, Time.newAbsolute(3, 4), Time.EternityTime));
    });
});
        