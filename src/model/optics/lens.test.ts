
/*

    A lens should be able to get and set items in a structure.

    The ultimate lens is projectEventLens(criterion)(project: ProjectDef): MusicEvent.

    This could be created as a composition of partial lenses, like 
        scoreFromProjectLens
        staffFromScoreLens
        voiceFromStaffLens
        eventFromVoiceLens
    The problem with this is the possiblilty of references to variables defined outside the score.

    Things to do:
        Evaluating (nested) references to variables
        Lens by time (+ voice index or var name)
        Lens by query
    and these could in reality be Traversals or Optionals rather than Lenses.
*/

import { Time } from '../rationals/time';
import { expect } from 'chai';
import { JMusic, JMusicVars, initStateInSequence } from '../facade/jmusic';
import R = require('ramda');
import { createNoteFromLilypond } from '../notes/note';
import { FlexibleSequence } from '../score/flexible-sequence';
import { ISequence, isNote } from '../score/sequence';
import { ProjectDef, VariableDef, FlexibleItem } from '../score/types';
import { VariableRepository, setVar } from '../score/variables';
import { projectLensByIndex, projectLensByTime } from './lens';

describe('Lenses', () => {


    describe('Lens by index', () => {

        let sc: JMusic;
        let projectDef: ProjectDef;

        beforeEach(() => {
            sc = new JMusic({ 
                content: [['g4 a4 b4 bes4', 'c4 d4 e4 f4'], [[['c,4 d,4'], ['e,4'], 'f,4']]],
                meter: '6/8',
                clefs: [ 'alto', 'tenor' ],
                key: 'g \\minor'
            });

            sc.setVar('theVar', 'aes4 ges4 ees4 des4');

            const vars1 = R.prop('vars', sc.vars) as unknown as VariableDef[];

            projectDef = {
                score: R.pick(['staves'], sc),
                vars: vars1//[{id: 'theVar', value: 'aes4 ges4 ees4 des4' }]
            };
        });

        it('should read an element at an index lens', () => {
            const lens = projectLensByIndex({
                staff: 0,
                voice: 1,
                element: 3
            });

            const res = R.view(lens, projectDef);

            expect(res).to.deep.eq(createNoteFromLilypond('f4'));
        });

        it('should write an element at an index lens', () => {
            const lens = projectLensByIndex({
                staff: 0,
                voice: 1,
                element: 3
            });

            const res = R.set(lens, createNoteFromLilypond('fis4'), projectDef);

            expect(res.score.staves[0].voices[1].content).to.deep.eq(['c4', 'd4', 'e4', 'fis4']);
        });

        it('should read a nested element at an index lens', () => {
            const lens = projectLensByIndex({
                staff: 1,
                voice: 0,
                element: 2
            });

            const res = R.view(lens, projectDef);

            expect(res).to.deep.eq(createNoteFromLilypond('e,4'));
        });

        it('should write a nested element at an index lens', () => {
            const lens = projectLensByIndex({
                staff: 1,
                voice: 0,
                element: 1
            });

            const res = R.set(lens, createNoteFromLilypond('des,4'), projectDef);

            expect(res.score.staves[1].voices[0].content).to.deep.eq([['c,4', 'des,4'], 'e,4', 'f,4']);
        });

        it('should read an element from a variable', () => {
            const lens = projectLensByIndex({
                variable: 'theVar',
                element: 2
            });

            const res = R.view(lens, projectDef);

            expect(res).to.deep.eq(createNoteFromLilypond('ees4'));
        });

        it('should write an element at a variable lens', () => {
            const lens = projectLensByIndex({
                variable: 'theVar',
                element: 2
            });

            const res = R.set(lens, createNoteFromLilypond('fis4'), projectDef);

            expect(res.vars).to.deep.eq([{
                id: 'theVar',
                value: ['aes4', 'ges4', 'fis4', 'des4']
            }]);
        });

    });

    
    describe('Lens by time', () => {

        let sc: JMusic;
        let projectDef: ProjectDef;

        beforeEach(() => {
            sc = new JMusic({ 
                content: [['g4 a4 b4 bes4', ['c4 d4 e4 f4', { variable: 'theVar' }]], [[['c,4 d,4'], ['e,4'], 'f,4']]],
                meter: '6/8',
                clefs: [ 'alto', 'tenor' ],
                key: 'g \\minor'
            }, 
            { 
                theVar: 'aes4 ges4 ees4 des4' 
            }
            );

            //sc.vars.setVar('theVar', 'aes4 ges4 ees4 des4');

            const vars1 = R.prop('vars', sc.vars) as unknown as VariableDef[];

            projectDef = {
                score: R.pick(['staves'], sc),
                vars: vars1
            };
        });

        it('should read an element at a time lens', () => {
            const lens = projectLensByTime({
                staff: 0,
                voice: 1,
                time: Time.newAbsolute(3, 4),
                eventFilter: isNote
            });

            const res = R.view(lens, projectDef);

            expect(res).to.deep.eq(createNoteFromLilypond('f4'));
        });

        it('should write an element at an time lens', () => {
            const lens = projectLensByTime({
                staff: 0,
                voice: 0,
                time: Time.newAbsolute(3, 4),
                eventFilter: isNote
            });

            const res = R.set(lens, createNoteFromLilypond('fis4'), projectDef);

            expect(res.score.staves[0].voices[0].content).to.deep.eq(['g4', 'a4', 'b4', 'fis4']);
        });

        
        it('should read a nested element at a time lens', () => {
            const lens = projectLensByTime({
                staff: 1,
                voice: 0,
                time: Time.newAbsolute(1, 2),
                eventFilter: isNote
            });

            const res = R.view(lens, projectDef);

            expect(res).to.deep.eq(createNoteFromLilypond('e,4'));
        });

        it('should write a nested element at a time lens', () => {
            const lens = projectLensByTime({
                staff: 1,
                voice: 0,
                time: Time.newAbsolute(1, 4),
                eventFilter: isNote
            });

            const res = R.set(lens, createNoteFromLilypond('fis,4'), projectDef);

            expect(res.score.staves[1].voices[0].content).to.deep.eq([['c,4', 'fis,4'], 'e,4', 'f,4']);
        });

        it('should read an element from a variable using a time lens', () => {
            const lens = projectLensByTime({
                staff: 0,
                voice: 1,
                time: Time.newAbsolute(5, 4),
                eventFilter: isNote
            });

            const res = R.view(lens, projectDef);

            expect(res).to.deep.eq(createNoteFromLilypond('ges4'));
        });

        it('should write an element to a variable using a time lens', () => {
            const lens = projectLensByTime({
                staff: 0,
                voice: 1,
                time: Time.newAbsolute(5, 4),
                eventFilter: isNote
            });

            const res = R.set(lens, createNoteFromLilypond('fis4'), projectDef);

            expect(res.vars).to.deep.eq([{
                id: 'theVar',
                value: ['aes4', 'fis4', 'ees4', 'des4']
                //value: ['aes4', 'fis4', 'ees4', 'des4'].map(createNoteFromLilypond).map(x => [x])
            }]);
        });

    });

    describe('Sequence lens', () => {
        const seq1Text = 'c4 d8 e8';
        const seq2Text = 'c,2 d,8 e,8 c4';
        const seq3Text = 'c,2 d,8 <e, c>4';
    

        let seq1: ISequence, seq2: ISequence;
        /*let lens: NoteLens;
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
        it('should set a note from a sequence refering to a variable', () => {
            const var1: VariableDef = { id: 'var1', value: new FlexibleSequence(['c4', 'd4']) };
            const vars = new VariableRepository([var1]);
            const seq1Text: FlexibleItem = ['f8', { variable: 'var1' }, 'g8'];
    
            const seq1 = new FlexibleSequence(seq1Text, vars);

            lens = noteLens(Time.newAbsolute(3, 8));

            const seq2a = R.set(lens, createNoteFromLilypond('e4'), seq1);

            const result = seq2a.elements;
    
            expect(result[2]).to.deep.eq(createNoteFromLilypond('e4'));
            //expect(vars.valueOf('var1').elements[1]).to.deep.eq(createNoteFromLilypond('e4'));

        });*/

        it('should get a note from a sequence refering to a function of a variable');
    });

});