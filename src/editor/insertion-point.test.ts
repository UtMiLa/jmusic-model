import { VariableRepository, createRepo } from './../model/score/variables';
import { Time } from './../model/rationals/time';
import { NoteDirection, ClefType, SimpleSequence, ScoreDef, scoreDefToScore, Score } from '../model';
import { expect } from 'chai';
import { InsertionPoint } from './insertion-point';

describe('Insertion point', () => {
    const seq1Text = 'c4 d8 e8 f4';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4 f,8';
    let score: Score;

    beforeEach(() => { 
        score = scoreDefToScore({staves: [
            {
                initialClef: {clefType: ClefType.G, line: -2},
                initialKey: {accidental: 1, count: 1 },
                voices:[
                    {
                        content: seq1Text,
                        noteDirection: NoteDirection.Up
                    },
                    {
                        content: seq2Text,
                        noteDirection: NoteDirection.Down
                    }
                ]
            },
            {
                initialClef: {clefType: ClefType.F, line: 2},
                initialKey: {accidental: 1, count: 1 },
                voices:[
                    {
                        content: seq3Text,
                        noteDirection: NoteDirection.Undefined
                    }
                ]
            }
        ]}, createRepo([]));
    });

    it('should create an insertion point', () => {

        const insP = new InsertionPoint(score);

        expect(insP.score).to.equal(score);
        expect(insP.time).to.deep.equal(Time.StartTime);
        expect(insP.staffNo).to.equal(0);
        expect(insP.voiceNo).to.equal(0);
    });


    it('should set an insertion point', () => {

        const insP = new InsertionPoint(score);

        insP.moveToTime(Time.newAbsolute(5, 8));
        insP.moveToVoice(1, 0);

        //expect(insP.score).to.equal(score);
        expect(insP.time).to.deep.equal(Time.newAbsolute(5, 8));
        expect(insP.staffNo).to.equal(1);
        expect(insP.voiceNo).to.equal(0);
    });

    it('should find a note by time', () => {

        const insP = new InsertionPoint(score);

        const res1 = insP.findIndex(Time.newAbsolute(1, 2));
        expect(res1).to.eq(3);

        expect(insP.findIndex(Time.newAbsolute(1, 4))).to.eq(1);

        insP.moveToVoice(1, 0);

        expect(insP.findIndex(Time.newAbsolute(1, 2))).to.eq(1);
        expect(insP.findIndex(Time.newAbsolute(5, 8))).to.eq(2);
    });


    it('should move an insertion right', () => {

        const insP = new InsertionPoint(score);

        insP.moveToTime(Time.newAbsolute(1, 2));
        insP.moveToVoice(1, 0);

        insP.moveRight();

        expect(insP.time).to.deep.equal(Time.newAbsolute(5, 8));
        expect(insP.staffNo).to.equal(1);
        expect(insP.voiceNo).to.equal(0);

        insP.moveRight();

        expect(insP.time).to.deep.equal(Time.newAbsolute(7, 8));

    });

    it('should move an insertion left', () => {

        const insP = new InsertionPoint(score);

        insP.moveToTime(Time.newAbsolute(3, 4));
        insP.moveToVoice(0, 1);

        insP.moveLeft();

        expect(insP.time).to.deep.equal(Time.newAbsolute(5, 8));
        
        insP.moveLeft();

        expect(insP.time).to.deep.equal(Time.newAbsolute(1, 2));

    });

    it('should allow a position after last note', () => {
   
        const insP = new InsertionPoint(score);

        insP.moveToTime(Time.newAbsolute(3, 4));
        insP.moveToVoice(0, 1);

        insP.moveRight();

        expect(insP.time).to.deep.equal(Time.newAbsolute(1, 1));
        expect(insP.staffNo).to.equal(0);
        expect(insP.voiceNo).to.equal(1);

        insP.moveRight();

        expect(insP.time).to.deep.equal(Time.newAbsolute(1, 1));

        insP.moveLeft();
     
        expect(insP.time).to.deep.equal(Time.newAbsolute(3, 4));
    });

});