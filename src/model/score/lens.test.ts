import { ScoreDef } from './score';
import { InsertionPoint } from '../../editor/insertion-point';
import { Time } from '../rationals/time';
import { expect } from 'chai';
import { JMusic, JMusicVars, initStateInSequence } from '../facade/jmusic';
import { Lens, NoteLens, ProjectDef, noteLens, view } from './lens';
import R = require('ramda');
import { VariableDef, VariableRepository } from './variables';
import { FlexibleItem, FlexibleSequence } from './flexible-sequence';
import { ISequence } from './sequence';
import { createNoteFromLilypond } from '../notes/note';

describe('Lenses', () => {


    describe('Score lens', () => {

        let sc: JMusic;
        let projectDef: ProjectDef;

        beforeEach(() => {
            sc = new JMusic({ 
                content: [['g4 g4 g4 g4', 'c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4']],
                meter: '6/8',
                clefs: [ 'alto', 'tenor' ],
                key: 'g \\minor'
            });

            sc.vars.setVar('theVar', new FlexibleSequence('a4 a4 a4 a4'));

            const vars1 = R.prop('vars', sc.vars) as unknown as VariableDef[];
            const toPairFunc = R.props<string, FlexibleSequence>(['id', 'value']) as unknown as  ((x: VariableDef) => [string, FlexibleSequence]);
            const varPairs = R.map(toPairFunc, vars1) as unknown as readonly [string, FlexibleSequence][];
            const varObj = R.fromPairs<FlexibleSequence>(varPairs);

            projectDef = {
                score: R.pick(['staves'], sc),
                vars: varObj
            };
        });

        it('should read elements from a score lens', () => {
            const lens = new Lens({
                startTime: Time.StartTime,
                voices: [[[0, 0], [0, 1]], [[1, 0]]]
            });

            const res = view(lens, projectDef);

            expect(res).to.deep.eq(sc.staves);
        });

        it('should convert voice list to full path', () => {
            const lens = new Lens({
                startTime: Time.StartTime,
                voices: [[[0, 0], [0, 1]], [[1, 0]]]
            });

            const res = lens.getPaths();

            expect(res).to.deep.eq([[['score', 'staves', 0, 'voices', 0], ['score', 'staves', 0, 'voices', 1]], [['score', 'staves', 1, 'voices', 0]]]);
        });

        it('should convert voice list to full path, another example', () => {
            const lens = new Lens({
                startTime: Time.StartTime,
                voices: [[[0, 1], [1, 0]]]
            });

            const res = lens.getPaths();

            expect(res).to.deep.eq([[['score', 'staves', 0, 'voices', 1], ['score', 'staves', 1, 'voices', 0]]]);
        });

        it('should pick voices defined by a lens', () => {
            const lens = new Lens({
                startTime: Time.StartTime,
                voices: [[[0, 1], [1, 0]]]
            });

            const res = view(lens, projectDef);

            expect(res).to.have.length(1);
            expect(res[0]).to.deep.eq({ 
                voices: [sc.staves[0].voices[1], sc.staves[1].voices[0]],
                initialKey: sc.staves[0].initialKey,
                initialClef: sc.staves[0].initialClef,
                initialMeter: sc.staves[0].initialMeter
            });
        });
    
        it('should convert variable name to full path, another example', () => {
            const lens = new Lens({
                startTime: Time.StartTime,
                voices: [['theVar']]
            });

            const res = lens.getPaths();

            expect(res).to.deep.eq([[['vars', 'theVar']]]);
        });

        it('should return a variable defined by a lens', () => {
            const lens = new Lens({
                startTime: Time.StartTime,
                voices: [['theVar']]
            });

            const res = view(lens, projectDef);

            expect(res).to.have.length(1);
            expect(res[0]).to.deep.eq({ 
                voices: [projectDef.vars['theVar']],
                initialKey: undefined,
                initialClef: undefined,
                initialMeter: undefined
            });
        });
    
    });

    describe('Sequence lens', () => {
        const seq1Text = 'c4 d8 e8';
        const seq2Text = 'c,2 d,8 e,8 c4';
        const seq3Text = 'c,2 d,8 <e, c>4';
    

        let seq1: ISequence, seq2: ISequence;
        let lens: NoteLens;
        beforeEach(() => {
            seq1 = new FlexibleSequence('c1 d4 e4 fis2. g4 a2 r2');
            lens = noteLens(Time.newAbsolute(9, 4));

            seq2 = new FlexibleSequence([seq1Text, [seq3Text, seq2Text]]);

        });


        it('should get a note by time from a sequence', () => {
            const res = R.view(lens, seq1);

            expect(res).to.deep.eq(createNoteFromLilypond('g4'));
        });

        it('should change a note by time from a sequence', () => {
            const res = R.set(lens, createNoteFromLilypond('b4'), seq1);

            expect(res.elements).to.have.length(seq1.elements.length);
            for (let i = 0; i < seq1.elements.length; i++) {
                if (i === 4) {
                    expect(res.elements[i], 'i = 4').to.deep.eq(createNoteFromLilypond('b4'));
                } else {
                    expect(res.elements[i], 'i = ' + i).to.deep.eq(seq1.elements[i]);
                }
            }
            
        });


        it('should remove a note by time from a sequence', () => {
            const res = R.set(lens, undefined, seq1);

            expect(res.elements).to.have.length(seq1.elements.length - 1);
            for (let i = 0; i < res.elements.length; i++) {
                if (i < 4) {
                    expect(res.elements[i], 'i = ' + i).to.deep.eq(seq1.elements[i]);
                } else {
                    expect(res.elements[i], 'i = ' + i).to.deep.eq(seq1.elements[i + 1]);
                }
            }
            
        });
        
        it('should get a note from a nested sequence', () => {
            expect(seq2.elements.length).to.eq(10);            
            expect(seq2.def).to.deep.eq([['c4', 'd8', 'e8'], [['c,2', 'd,8', '<e, c>4'], ['c,2', 'd,8', 'e,8', 'c4']]]);    

            lens = noteLens(Time.newAbsolute(4, 4));

            const res = R.view(lens, seq2);
            expect(res, 'getter').to.deep.eq(createNoteFromLilypond('d,8'));

            const seq2a = R.set(lens, createNoteFromLilypond('e4'), seq2);
            //expect((seq2 as FlexibleSequence).structuredElements).to.deep.eq([['c4', 'd8', 'e8'], [['c,2', 'd,8', '<e, c>4'], ['c,2', 'd,8', 'e,8', 'c4']]]);    
            expect(seq2a.def).to.deep.eq([['c4', 'd8', 'e8'], [['c,2', 'e4', '<e, c>4'], ['c,2', 'd,8', 'e,8', 'c4']]]);    

        });
        it('should get a note from a sequence refering to a variable', () => {
            const var1: VariableDef = { id: 'var1', value: new FlexibleSequence(['c4', 'd4']) };
            const vars = new VariableRepository([var1]);
            const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];
    
            const seq1 = new FlexibleSequence(seq1Text, vars);

            lens = noteLens(Time.newAbsolute(3, 8));

            const res = R.view(lens, seq1);
            expect(res, 'getter').to.deep.eq(createNoteFromLilypond('d4'));

        });
        xit('should set a note from a sequence refering to a variable', () => {
            const var1: VariableDef = { id: 'var1', value: new FlexibleSequence(['c4', 'd4']) };
            const vars = new VariableRepository([var1]);
            const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];
    
            const seq1 = new FlexibleSequence(seq1Text, vars);

            lens = noteLens(Time.newAbsolute(3, 8));

            const seq2a = R.set(lens, createNoteFromLilypond('e4'), seq1);

            const result = seq2a.elements;
    
            expect(result[2]).to.deep.eq(createNoteFromLilypond('e4'));
            //expect(vars.valueOf('var1').elements[1]).to.deep.eq(createNoteFromLilypond('e4'));

        });

        it('should get a note from a sequence refering to a function of a variable');
    });

});