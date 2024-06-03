import { ActiveSequence } from '../model/active-project/types';
import { Time } from './../model/rationals/time';
import { expect } from 'chai';
import { Clef, DomainConverter, JMusic, ProjectDef, ScoreDef, VoiceContentDef, createRepo, isNote } from '../model';
import { createTestScore } from '../tools/test-tools';
import { SelectionVoiceTime } from './query';
import { SelectionLens } from './selection-lens';
import R = require('ramda');
import { convertSequenceDataToActive, convertActiveSequenceToData } from '../model/active-project/conversions';

describe('Selection lensing', () => {
    let source: ScoreDef;
    let proj: ProjectDef;
    let domainConverter: DomainConverter<VoiceContentDef, ActiveSequence>;

    beforeEach(() => {
        source = createTestScore([['c\'4 d\'2 e\'8 f\'8 g\'4'], ['c8 d8 e8 f8 g4. f8 e4 d4 c2']], [4, 4], [0, 0]);
        const vars = createRepo({});
        proj = {
            score: source,
            vars: vars.vars
        };
        domainConverter = {
            fromDef: def => convertSequenceDataToActive(def, vars.vars),
            toDef: events => convertActiveSequenceToData(events)
        };
    });

    it('should get items in selection', () => {
        const selection = new SelectionVoiceTime(new JMusic(source), 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const getterLens = new SelectionLens(selection);
        const items = getterLens.get(proj, domainConverter);

        expect(items).to.be.deep.eq(['e8', 'f8', 'g4.']);
    });

    
    it('should modify items in selection - no change', () => {
        const selection = new SelectionVoiceTime(new JMusic(source), 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const setterLens = new SelectionLens(selection);
        const expected = createTestScore([['c\'4 d\'2 e\'8 f\'8 g\'4'], ['c8 d8 e8 f8 g4. f8 e4 d4 c2']], [4, 4], [0, 0]);

        const items = setterLens.change(proj, event => [event]);

        const eeee = new JMusic(expected);
        expect(items).to.be.deep.eq(eeee.project);
    });

    it('should modify items in selection - delete', () => {
        const selection = new SelectionVoiceTime(new JMusic(source), 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const setterLens = new SelectionLens(selection);
        const items = setterLens.change(proj, () => []);
        const source1 = source = createTestScore([['c\'4 d\'2 e\'8 f\'8 g\'4'], ['c8 d8 f8 e4 d4 c2']], [4, 4], [0, 0]);

        expect(new JMusic(items)).to.be.deep.eq(new JMusic(source1));
    });

    it('should modify items in selection - add note expression', () => {
        const selection = new SelectionVoiceTime(new JMusic(source), 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const setterLens = new SelectionLens(selection);
        const items = setterLens.change(proj, (note) => [isNote(note) ? {...note, expressions: [...note.expressions ?? [], 'staccato'] } : note]);
        const source1 = createTestScore([['c\'4 d\'2 e\'8 f\'8 g\'4'], ['c8 d8 e8\\staccato f8\\staccato g4.\\staccato f8 e4 d4 c2']], [4, 4], [0, 0]);

        expect(new JMusic(items)).to.be.deep.eq(new JMusic(source1));
        expect(new JMusic(items)).to.not.be.deep.eq(new JMusic(source));
    });
    

    it('should not modify variable references', () => {        
        const vars = { e: ['c4', 'd4'], d: ['c4', 'd4'] };
        const source = new JMusic({
            staves: [{
                voices: [{ contentDef: ['c\'4 d\'2', { variable: 'e' }, 'f\'8 g\'4'] }],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }, {
                voices: [{ contentDef: ['c8 d8 e8 f8 g4. f8 e4', { variable: 'd' }, 'c2']}],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }]
        }, vars);
        const selection = new SelectionVoiceTime(source, 1, 0, Time.newAbsolute(1, 4), Time.newAbsolute(3, 4));
        const setterLens = new SelectionLens(selection);

        const items = setterLens.change(source.model.project, () => []);
        const source1 = new JMusic({
            staves: [{
                voices: [{ contentDef: ['c\'4', 'd\'2', { variable: 'e' }, 'f\'8', 'g\'4'] }],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }, {
                voices: [{ contentDef: ['c8', 'd8', 'f8', 'e4', { variable: 'd' }, 'c2']}],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }]
        }, vars);

        expect(items).to.be.deep.eq(source1.model.project);
    });




    
    it('should modify variable content', () => {        
        const vars = { e: ['c4', 'd4'], d: ['c4', 'd4'] };
        const source = new JMusic({
            staves: [{
                voices: [{ contentDef: ['c\'4 d\'2', { variable: 'e' }, 'f\'8 g\'4'] }],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }, {
                voices: [{ contentDef: ['c8 d8 e8 f8 g4. f8 e4', { variable: 'd' }, 'c2']}],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }]
        }, vars);
        const selection = new SelectionVoiceTime(source, 0, 0, Time.newAbsolute(1, 1), Time.newAbsolute(5, 4));
        const setterLens = new SelectionLens(selection);

        const items = setterLens.change(source.model.project, (x) => [x, x]);
        const vars1 = { e: ['c4', 'd4', 'd4'], d: ['c4', 'd4'] };
        const source1 = new JMusic({
            staves: [{
                voices: [{ contentDef: ['c\'4', 'd\'2', { variable: 'e' }, 'f\'8', 'g\'4'] }],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }, {
                voices: [{ contentDef: ['c8', 'd8', 'e8', 'f8', 'g4.', 'f8', 'e4', { variable: 'd' }, 'c2']}],
                initialClef: Clef.clefTreble.def,
                initialKey: { accidental: 0, count: 0 }
            }]
        }, vars1);

        expect(items).to.be.deep.eq(source1.model.project);
    });

});
