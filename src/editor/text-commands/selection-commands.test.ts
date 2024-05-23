import { Interval } from './../../../dist/model/pitches/intervals.d';
import { Key } from './../../model/states/key';
import { Clef } from './../../model/states/clef';
import { SelectionBy } from './../../selection/query';
import { ElementIdentifier, SelectionManager } from './../../selection/selection-types';
import { JMusic } from './../../model/facade/jmusic';
import { expect } from 'chai';
import { InsertionPoint } from '../insertion-point';
import { TextCommandEngine } from '../text-command-engine';
import { FlexibleSequence } from '~/model';

describe('Selection commands', () => {

    it('should add an expression on selected notes', () => {
        const jMusic = new JMusic('c4 c4 c4 c4');
        const ins1 = new InsertionPoint(jMusic);
        const selection = new SelectionBy((elem: ElementIdentifier) => !(elem.elementNo % 2));

        const command = TextCommandEngine.parse('selection \\tenuto');
        
        const selMan = new SelectionManager();
        selMan.setSelection(selection);
            
        command.execute(jMusic, ins1, selMan);

        expect(jMusic.model.staves[0].voices[0].content.asObject).to.deep.equal(['c4\\tenuto', 'c4', 'c4\\tenuto', 'c4']);
    });

    it('should add an expression on selected notes - through a function', () => {
        const jMusic = new JMusic({
            staves: [{
                voices: [{
                    contentDef: [ { function: 'Transpose', extraArgs: [{ interval: 1, alteration: 1 } as Interval], args: ['c4 c4 c4 c4'] } ]
                }],
                initialClef: Clef.clefTreble.def,
                initialKey: {accidental: 0, count: 0 }
            }]
        }
        );
        const ins1 = new InsertionPoint(jMusic);
        const selection = new SelectionBy((elem: ElementIdentifier) => !(elem.elementNo % 2));

        const command = TextCommandEngine.parse('selection \\tenuto');
        
        const selMan = new SelectionManager();
        selMan.setSelection(selection);
            
        command.execute(jMusic, ins1, selMan);

        expect(jMusic.model.staves[0].voices[0].content.elements).to.deep.equal(new FlexibleSequence(['d4\\tenuto', 'd4', 'd4\\tenuto', 'd4']).elements);
    });

    
    it('should add an expression on selected notes - through a variable', () => {
        const jMusic = new JMusic({
            staves: [{
                voices: [{
                    contentDef: [ { variable: 'v1' } ]
                }],
                initialClef: Clef.clefTreble.def,
                initialKey: {accidental: 0, count: 0 }
            }]
        }, { v1: 'c4 c4 c4 c4' }
        );
        const ins1 = new InsertionPoint(jMusic);
        const selection = new SelectionBy((elem: ElementIdentifier) => !(elem.elementNo % 2));

        const command = TextCommandEngine.parse('selection \\tenuto');
        
        const selMan = new SelectionManager();
        selMan.setSelection(selection);
            
        command.execute(jMusic, ins1, selMan);

        expect(jMusic.model.staves[0].voices[0].content.elements).to.deep.equal(new FlexibleSequence(['c4\\tenuto', 'c4', 'c4\\tenuto', 'c4']).elements);
    });
});