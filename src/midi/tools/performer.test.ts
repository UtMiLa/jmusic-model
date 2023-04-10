import * as sinon from 'sinon';
import { JMusic } from '../../model';
import { MidiPerformer, MidiPlayer } from './performer';
import { expect } from 'chai';


describe('MIDI performer', () => {
    it('should return sorted midi events for a score', () => {
        const score = new JMusic({content: [['c\'4 d\'2 c\'4'], ['<e g>8 f8 g4 e2']]});
        const velocity = 100;
        const channel = 0;
        const percent = .85;
        const tempo = 3000;

        const midiPerformer = new MidiPerformer();

        const res = midiPerformer.getMusicEvents(score);

        expect(res).to.have.length(5);
        expect(res).to.deep.eq([
            [
                {
                    channel,
                    velocity,
                    pitches: [60],
                    time: tempo * 0,
                    duration: tempo / 4 * percent
                }, 
                {
                    channel,
                    velocity,
                    pitches: [52, 55],
                    time: tempo * 0,
                    duration: tempo / 8 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitches: [53],
                    time: tempo / 8,
                    duration: tempo / 8 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitches: [62],
                    time: tempo / 4,
                    duration: tempo / 2 * percent
                },
                {
                    channel,
                    velocity,
                    pitches: [55],
                    time: tempo / 4,
                    duration: tempo / 4 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitches: [52],
                    time: tempo / 2,
                    duration: tempo / 2 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitches: [60],
                    time: tempo * 3 / 4,
                    duration: tempo / 4 * percent
                }
            ]
        ]);
    });

    it('should call midiplayer', () => {
        const score = new JMusic({content: [['c\'4 d\'2 c\'4'], ['<e g>8 f8 g4 e2']]});
        const velocity = 100;
        const channel = 0;
        const percent = .85;
        const tempo = 3000;


        const midiPerformer = new MidiPerformer();

        const player: MidiPlayer = {
            playNote: (channel: number, velocity: number, pitches: number[], startTime: number, duration: number): void => {
                //
            }
        };

        const spyPlayer = sinon.spy(player);

        const res = midiPerformer.perform(score, spyPlayer);

        expect(spyPlayer.playNote.calledWith(channel, velocity, [60], 0, tempo / 4 * percent)).to.be.true;
        expect(spyPlayer.playNote.calledWith(channel, velocity, [52, 55], 0, tempo / 8 * percent)).to.be.true;
        expect(spyPlayer.playNote.calledWith(channel, velocity, [53], tempo / 8, tempo / 8 * percent)).to.be.true;
        expect(spyPlayer.playNote.calledWith(channel, velocity, [62], tempo / 4, tempo / 2 * percent)).to.be.true;
        expect(spyPlayer.playNote.calledWith(channel, velocity, [55], tempo / 4, tempo / 4 * percent)).to.be.true;
    });
});