import { ScoreDef } from './../score/score';
import { InsertionPoint } from './../../editor/insertion-point';
import { Time } from './../rationals/time';
import { expect } from 'chai';
import { JMusic, JMusicVars, initStateInSequence } from './jmusic';
import { Lens, ProjectDef, view } from './lens';
import R = require('ramda');
import { VariableDef } from '../score/variables';
import { FlexibleSequence } from '../score/flexible-sequence';

describe('Lenses', () => {


    describe('Read from lens', () => {

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

});