import { JMusic } from './../model/facade/jmusic';
import { Time } from './../model/rationals/time';
import { expect } from 'chai';
import { SelectionAll, SelectionVoiceTime } from './query';
import { createTestScore } from '../tools/test-tools';
import { ScoreDef, ClefType, NoteDirection } from '~/model';


describe('Queries', () => {
    it('SelectionAll should select all elements', () => {
        const select = new SelectionAll();

        expect(select.isSelected({ elementNo: 9999, staffNo: -8, voiceNo: 500 })).to.be.true;
    });

    
    it('should select all elements in one voice', () => {

        const model = createTestScore([['c\'4 d\'2 e\'8 f\'8 g\'4'], ['c8 d8 e8 f8 g4. f8 e4 d4 c2']], [4, 4], [0, 0]);

        const select = new SelectionVoiceTime(new JMusic(model), 1, 0, Time.StartTime, Time.EternityTime);

        expect(select.isSelected({ elementNo: 0, staffNo: 0, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 1, staffNo: 0, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 0, staffNo: 0, voiceNo: 1 })).to.be.false;
        expect(select.isSelected({ elementNo: 1, staffNo: 0, voiceNo: 1 })).to.be.false;
        expect(select.isSelected({ elementNo: 0, staffNo: 1, voiceNo: 0 })).to.be.true;
        expect(select.isSelected({ elementNo: 1, staffNo: 1, voiceNo: 0 })).to.be.true;
    });

    it('should select all elements in one voice', () => {

        const model = createTestScore([['c\'4 d\'2 e\'8 f\'8 g\'4 f\'4 e\'2'], ['c8 d8 e8 f8 g4. f8 e4 d4 c2']], [4, 4], [0, 0]);

        const select = new SelectionVoiceTime(new JMusic(model), 1, 0, Time.newAbsolute(7, 8), Time.newAbsolute(5, 4));

        expect(select.isSelected({ elementNo: 0, staffNo: 0, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 1, staffNo: 0, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 4, staffNo: 0, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 0, staffNo: 0, voiceNo: 1 })).to.be.false;
        expect(select.isSelected({ elementNo: 1, staffNo: 0, voiceNo: 1 })).to.be.false;
        expect(select.isSelected({ elementNo: 0, staffNo: 1, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 1, staffNo: 1, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 2, staffNo: 1, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 3, staffNo: 1, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 4, staffNo: 1, voiceNo: 0 })).to.be.false;
        expect(select.isSelected({ elementNo: 5, staffNo: 1, voiceNo: 0 })).to.be.true;
        expect(select.isSelected({ elementNo: 6, staffNo: 1, voiceNo: 0 })).to.be.true;
        expect(select.isSelected({ elementNo: 7, staffNo: 1, voiceNo: 0 })).to.be.false;
    });
});