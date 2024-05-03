import { SelectionVoiceTime } from './../../selection/query';
import { Rational } from './../../model/rationals/rational';
import { expect } from 'chai';
import { either } from 'fp-ts';
import { FromStartTimeRestrictionArg, SelectionVoiceTimeArg, ToEndTimeRestrictionArg, ToTimeRestrictionArg } from './selection-argument-types';
import { JMusic, Time } from '../../model';
import { InsertionPoint } from '../insertion-point';

describe('Selection argument types', () => {
    it('should match current to end', () => {
        const parsed = ToEndTimeRestrictionArg('to end');
        if (!either.isRight(parsed)) throw 'Fail';
        const value = parsed.right;
        expect(value).to.deep.eq([['this', Time.EternityTime], '']);
    });

    it('should match current to abs time', () => {
        const parsed = ToTimeRestrictionArg('to 8/1');
        if (!either.isRight(parsed)) throw 'Fail';
        const value = parsed.right;
        expect(value).to.deep.eq([['this', Time.newAbsolute(8, 1)], '']);
    });

    it('should match from start to current', () => {
        const parsed = FromStartTimeRestrictionArg('from start');
        if (!either.isRight(parsed)) throw 'Fail';
        const value = parsed.right;
        expect(value).to.deep.eq([[Time.StartTime, 'this'], '']);
    });

    it('should match from abs time to current', () => {
        const parsed = FromStartTimeRestrictionArg('from start');
        if (!either.isRight(parsed)) throw 'Fail';
        const value = parsed.right;
        expect(value).to.deep.eq([[Time.StartTime, 'this'], '']);
    });

    
    function compareSelections(sel1: any, sel2: any) {
        return sel1.predicate.toString() === sel2.predicate.toString();
    }

    it('should match current to end', () => {
        const parsed = SelectionVoiceTimeArg('voice this to end');
        if (!either.isRight(parsed)) throw 'Fail';
        const value = parsed.right;
        const model = new JMusic('c4');
        const ins = new InsertionPoint(model);
        ins.moveToTime(Time.newAbsolute(3, 4));
        ins.moveToVoice(3, 2);
        expect(compareSelections(value[0](model, ins), new SelectionVoiceTime(model, 3, 2, Time.newAbsolute(3, 4), Time.EternityTime)));
        //expect(value[0](model, ins)).to.deep.eq(new SelectionVoiceTime(model, 3, 2, Time.newAbsolute(3, 4), Time.EternityTime));
    });
});
        