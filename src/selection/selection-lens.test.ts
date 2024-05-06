import { Time } from './../model/rationals/time';
import { expect } from 'chai';
import { JMusic, ScoreDef } from '../model';
import { createTestScore } from '../tools/test-tools';
import { SelectionVoiceTime } from './query';
import { SelectionLens } from './selection-lens';
import R = require('ramda');
import { pipe } from 'fp-ts/lib/function';

describe('Selection lensing', () => {
    let source: ScoreDef;

    beforeEach(() => {
        source = createTestScore([['c\'4 d\'2 e\'8 f\'8 g\'4'], ['c8 d8 e8 f8 g4. f8 e4 d4 c2']], [4, 4], [0, 0]);
    });

    it('should get items in selection', () => {
        const selection = new SelectionVoiceTime(new JMusic(source), 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const getterLens = new SelectionLens(selection);
        const items = getterLens.get(source);

        expect(items).to.be.deep.eq(['e8', 'f8', 'g4.']);
    });

    
    it('should modify items in selection - no change', () => {
        const selection = new SelectionVoiceTime(new JMusic(source), 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const setterLens = new SelectionLens(selection);
        const items = setterLens.change(source, event => [event]);
        const source1 = pipe(
            source, 
            R.assocPath(['staves', 0, 'voices', 0, 'contentDef'], 'c\'4 d\'2 e\'8 f\'8 g\'4'.split(' ')),
            R.assocPath(['staves', 1, 'voices', 0, 'contentDef'], 'c8 d8 e8 f8 g4. f8 e4 d4 c2'.split(' '))
        );
        expect(items).to.be.deep.eq(source1);
    });

    it('should modify items in selection - delete', () => {
        const selection = new SelectionVoiceTime(new JMusic(source), 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const setterLens = new SelectionLens(selection);
        const items = setterLens.change(source, () => []);
        const source1 = pipe(
            source, 
            R.assocPath(['staves', 0, 'voices', 0, 'contentDef'], 'c\'4 d\'2 e\'8 f\'8 g\'4'.split(' ')),
            R.assocPath(['staves', 1, 'voices', 0, 'contentDef'], 'c8 d8 f8 e4 d4 c2'.split(' '))
        );

        expect(items).to.be.deep.eq(source1);
    });
});
