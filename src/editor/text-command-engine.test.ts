import { SelectionManager } from './../selection/selection-types';
import { expect } from 'chai';
import { InsertionPoint } from './insertion-point';
import Sinon = require('sinon');
import { Clef, ClefType, JMusic, Key, MeterFactory, Time, createNoteFromLilypond, isClefChange, isKeyChange, isMeterChange, valueOf } from '../model';
import { TextCommandEngine } from './text-command-engine';
import { StateChange } from '../model/states/state';
import { SelectionAll, SelectionVoiceTime } from '../selection/query';




describe('Text commands', () => {
    describe('Execute command', () => {

        let model: Sinon.SinonStubbedInstance<JMusic>, ins: Sinon.SinonStubbedInstance<InsertionPoint>;

        beforeEach(() => {
            model = Sinon.stub(new JMusic());
            ins = Sinon.stub(new InsertionPoint(model));
        });

        afterEach(() => {
            Sinon.reset();
        });

        it('should fail when gibberish', () => {
            expect(() => TextCommandEngine.parse('njvkrfldsb')).to.throw(/Unknown command/);
        });

        it('should select a voice', () => {
            const cmd = TextCommandEngine.parse('voice 2');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToVoice, 0, 1);
        });

        it('should select a voice on another staff', () => {
            const cmd = TextCommandEngine.parse('voice 2:1');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToVoice, 1, 0);
        });
        it('should select a voice on another staff, alternative notation', () => {
            const cmd = TextCommandEngine.parse('voice 7.3');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToVoice, 6, 2);
        });


        it('should move insertion point to absolute time', () => {
            const cmd = TextCommandEngine.parse('goto 4/4');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToTime, Time.newAbsolute(4, 4));
        });


        it('should move insertion point to next event', () => {
            const cmd = TextCommandEngine.parse('goto next');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveRight);
        });

        it('should move insertion point to previous event', () => {
            const cmd = TextCommandEngine.parse('goto prev');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveLeft);
        });


        it('should move insertion point to start', () => {
            const cmd = TextCommandEngine.parse('goto start');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(ins.moveToTime, Time.newAbsolute(0, 1));
        });


        it('should add an empty staff', () => {
            const cmd = TextCommandEngine.parse('add staff');

            const jMusic = new JMusic('c4 c4 c4 c4');

            expect(jMusic.model.project.score.staves).to.have.length(1);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.model.project.score.staves).to.have.length(2);
        });
        

        it('should set a key change', () => {
            const cmd = TextCommandEngine.parse('set  key  5#');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(model.insertElementAtInsertionPoint, ins, StateChange.newKeyChange(new Key({ accidental: 1, count: 5 })), isKeyChange);
        });


        it('should set a meter change', () => {
            const cmd = TextCommandEngine.parse('set meter\t3/8');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(model.insertElementAtInsertionPoint, ins, StateChange.newMeterChange(MeterFactory.createRegularMeter({ value: 8, count: 3 })), isMeterChange);
        });


        it('should set a clef change', () => {
            const cmd = TextCommandEngine.parse('set clef \\clef alto');
            
            cmd.execute(model, ins);

            Sinon.assert.calledOnceWithExactly(model.insertElementAtInsertionPoint, ins, StateChange.newClefChange(new Clef({ clefType: ClefType.C, line: 0 })), isClefChange);
        });





        it('should append music', () => {
            const cmd = TextCommandEngine.parse('append d4 e4 f2');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            //expect(jMusic.model.project.score.staves[0].voices[0].contentDef).to.have.length(1);
            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(7);
        });

        it('should append music with rest and spacer', () => {
            const cmd = TextCommandEngine.parse('append r4 s4 f2');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            //expect(jMusic.model.project.score.staves[0].voices[0].contentDef).to.have.length(1);
            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(7);
        });

        
        it('should append music with a key change', () => {
            const cmd = TextCommandEngine.parse('append 2b d4 e4 f2');
            //const cmd = TextCommandEngine.parse('append \\key f \\major d4 e4 f2');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(8);
            expect((jMusic.staves[0].voices[0].content.elements[4] as any).key.def).to.deep.eq({
                accidental: -1,
                count: 2
            });
        });


        it('should append music with a meter change', () => {
            const cmd = TextCommandEngine.parse('append 3/4 d4 e4 f4');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(8);
            expect((jMusic.staves[0].voices[0].content.elements[4] as any).meter.def).to.deep.eq({
                value: 4,
                count: 3
            });
        });

        
        it('should append music with a clef change', () => {
            const cmd = TextCommandEngine.parse('append \\clef bass d4 e4 f4');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            ins1.moveToTime(Time.newAbsolute(4, 4));

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(8);
            expect((jMusic.staves[0].voices[0].content.elements[4] as any).clef.def).to.deep.eq({
                clefType: ClefType.F,
                line: 2
            });
        });



        it('should set a variable', () => {
            const cmd = TextCommandEngine.parse('$varX = \\clef bass d4 e4 f4');

            const jMusic = new JMusic('c4 c4 c4 c4');
            const ins = new InsertionPoint(jMusic);
            
            cmd.execute(jMusic, ins);

            expect(valueOf(jMusic.vars,'varX').elements).to.have.length(4);
        });

        
        
        it('should append music with a variable reference', () => {
            const cmd = TextCommandEngine.parse('append d4 $varX f4');

            const jMusic = new JMusic('c4 c4 c4 c4', { varX: 'g2 a2'});
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(0, 0);
            
            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(4);
            
            cmd.execute(jMusic, ins1);

            expect(jMusic.staves[0].voices[0].content.elements).to.have.length(8);
            expect((jMusic.staves[0].voices[0].content.elements[6] as any)).to.deep.eq(createNoteFromLilypond('a2'));
        });

             
        
        it('should set selection to all', () => {
            const cmd = TextCommandEngine.parse('selection  set all');

            const jMusic = new JMusic('c4 c4 c4 c4', { varX: 'g2 a2'});
            const ins1 = new InsertionPoint(jMusic);

            const selMan = new SelectionManager();
            
            cmd.execute(jMusic, ins1, selMan);

            expect((selMan as any).selection).to.deep.eq(new SelectionAll());
        });


        
        it('should set selection to one voice', () => {
            const cmd = TextCommandEngine.parse('selection set  voice 1:2');

            const jMusic = new JMusic('c4 c4 c4 c4', { varX: 'g2 a2'});
            const ins1 = new InsertionPoint(jMusic);

            const selMan = new SelectionManager();
            
            cmd.execute(jMusic, ins1, selMan);

            expect((selMan as any).selection).to.deep.eq(new SelectionVoiceTime(jMusic, 0, 1, Time.StartTime, Time.EternityTime));
        });


        it('should set selection to one voice on staff given by inspoint', () => {
            const cmd = TextCommandEngine.parse('selection set  voice 2');

            const jMusic = new JMusic('c4 c4 c4 c4', { varX: 'g2 a2'});
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(1, 1);

            const selMan = new SelectionManager();
            
            cmd.execute(jMusic, ins1, selMan);

            expect((selMan as any).selection).to.deep.eq(new SelectionVoiceTime(jMusic, 1, 1, Time.StartTime, Time.EternityTime));
        });


        
        it('should set selection to the voice given by inspoint', () => {
            const cmd = TextCommandEngine.parse('selection set voice this');

            const jMusic = new JMusic('c4 c4 c4 c4', { varX: 'g2 a2'});
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(3, 5);

            const selMan = new SelectionManager();
            
            cmd.execute(jMusic, ins1, selMan);

            expect((selMan as any).selection).to.deep.eq(new SelectionVoiceTime(jMusic, 3, 5, Time.StartTime, Time.EternityTime));
        });


        it('should set selection to the current voice from the inspoint to the end', () => {
            const cmd = TextCommandEngine.parse('selection set voice this to end');

            const jMusic = new JMusic('c4 c4 c4 c4', { varX: 'g2 a2'});
            const ins1 = new InsertionPoint(jMusic);
            ins1.moveToVoice(3, 5);
            ins1.moveToTime(Time.newAbsolute(3, 4));

            const selMan = new SelectionManager();
            
            cmd.execute(jMusic, ins1, selMan);

            expect((selMan as any).selection).to.deep.eq(new SelectionVoiceTime(jMusic, 3, 5, Time.newAbsolute(3, 4), Time.EternityTime));
        });

        
        it('should clear the selection', () => {
            const cmd = TextCommandEngine.parse('selection clear');

            const jMusic = new JMusic('c4 c4 c4 c4', { varX: 'g2 a2'});
            const ins1 = new InsertionPoint(jMusic);

            const selMan = new SelectionManager();
            selMan.setSelection(new SelectionAll());
            
            cmd.execute(jMusic, ins1, selMan);

            expect((selMan as any).selection).to.be.undefined;
        });

    });
});