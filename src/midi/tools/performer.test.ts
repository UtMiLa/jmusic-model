import * as sinon from 'sinon';
import { JMusic, Time } from '../../model';
import { MidiPerformer, MidiPlayer } from './performer';
import { expect } from 'chai';

// Inspiration: https://galactic.ink/midi-js/

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
                    pitch: 60,
                    time: tempo * 0,
                    absTime: Time.newAbsolute(0, 1),
                    duration: tempo / 4 * percent
                }, 
                {
                    channel,
                    velocity,
                    pitch: 52,
                    time: tempo * 0,
                    absTime: Time.newAbsolute(0, 1),
                    duration: tempo / 8 * percent
                }, 
                {
                    channel,
                    velocity,
                    pitch: 55,
                    time: tempo * 0,
                    absTime: Time.newAbsolute(0, 1),
                    duration: tempo / 8 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 53,
                    time: tempo / 8,
                    absTime: Time.newAbsolute(1, 8),
                    duration: tempo / 8 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 62,
                    time: tempo / 4,
                    absTime: Time.newAbsolute(1, 4),
                    duration: tempo / 2 * percent
                },
                {
                    channel,
                    velocity,
                    pitch: 55,
                    time: tempo / 4,
                    absTime: Time.newAbsolute(1, 4),
                    duration: tempo / 4 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 52,
                    time: tempo / 2,
                    absTime: Time.newAbsolute(1, 2),
                    duration: tempo / 2 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 60,
                    time: tempo * 3 / 4,
                    absTime: Time.newAbsolute(3, 4),
                    duration: tempo / 4 * percent
                }
            ]
        ]);
    });



    it('should have configurable velocity, channel, tempo, and percent', () => {
        const score = new JMusic({content: [['c\'4 d\'2 c\'4'], ['<e g>8 f8 g4 e2']]});
        const velocity = 120;
        const channel = 2;
        const percent = .95;
        const tempo = 4000;

        const midiPerformer = new MidiPerformer({ velocity, channel, percent, tempo });

        const res = midiPerformer.getMusicEvents(score);

        expect(res).to.have.length(5);
        expect(res).to.deep.eq([
            [
                {
                    channel,
                    velocity,
                    pitch: 60,
                    time: tempo * 0,
                    absTime: Time.newAbsolute(0, 1),
                    duration: tempo / 4 * percent
                }, 
                {
                    channel,
                    velocity,
                    pitch: 52,
                    time: tempo * 0,
                    absTime: Time.newAbsolute(0, 1),
                    duration: tempo / 8 * percent
                }, 
                {
                    channel,
                    velocity,
                    pitch: 55,
                    time: tempo * 0,
                    absTime: Time.newAbsolute(0, 1),
                    duration: tempo / 8 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 53,
                    time: tempo / 8,
                    absTime: Time.newAbsolute(1, 8),
                    duration: tempo / 8 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 62,
                    time: tempo / 4,
                    absTime: Time.newAbsolute(1, 4),
                    duration: tempo / 2 * percent
                },
                {
                    channel,
                    velocity,
                    pitch: 55,
                    time: tempo / 4,
                    absTime: Time.newAbsolute(1, 4),
                    duration: tempo / 4 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 52,
                    time: tempo / 2,
                    absTime: Time.newAbsolute(1, 2),
                    duration: tempo / 2 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 60,
                    time: tempo * 3 / 4,
                    absTime: Time.newAbsolute(3, 4),
                    duration: tempo / 4 * percent
                }
            ]
        ]);
    });

    it('should work as a generator', () => {
        const score = new JMusic({content: [['c\'4 d\'2 c\'4'], ['<e g>8 f8 g4 e2']]});
        const velocity = 100;
        const channel = 0;
        const percent = .85;
        const tempo = 3000;


        const midiPerformer = new MidiPerformer();

        const g1 = midiPerformer.getMusicEventsByTime(score);

        const res1 = g1.next();

        expect(res1.value).to.deep.eq([
            {
                channel,
                velocity,
                pitch: 60,
                time: tempo * 0,
                absTime: Time.newAbsolute(0, 1),
                duration: tempo / 4 * percent
            }, 
            {
                channel,
                velocity,
                pitch: 52,
                time: tempo * 0,
                absTime: Time.newAbsolute(0, 1),
                duration: tempo / 8 * percent
            }, 
            {
                channel,
                velocity,
                pitch: 55,
                time: tempo * 0,
                absTime: Time.newAbsolute(0, 1),
                duration: tempo / 8 * percent
            }
        ]);
        const res2 = g1.next();
        expect(res2.value).to.deep.eq([
            {
                channel,
                velocity,
                pitch: 53,
                time: tempo / 8,
                absTime: Time.newAbsolute(1, 8),
                duration: tempo / 8 * percent
            }
        ]);
        g1.next();
        g1.next();
        const res5 = g1.next();
        expect(res5.done).to.be.false;
        const res6 = g1.next();
        expect(res6.done).to.be.true;
    });

    it('should call midiplayer', (done) => {
        const score = new JMusic({content: [['c\'4 d\'2 c\'4'], ['<e g>8 f8 g4 e2']]});
        const velocity = 100;
        const channel = 0;
        const percent = .85;
        const tempo = 0;


        const midiPerformer = new MidiPerformer({ velocity, channel, percent, tempo });

        const player: MidiPlayer = {
            playNote: (channel: number, velocity: number, pitch: number, startTime: number, duration: number): void =>{
                //
            }
        };

        const spyPlayer = sinon.spy(player);

        midiPerformer.perform(score, spyPlayer, () => {
            expect(spyPlayer.playNote.calledWith(channel, velocity, 60, 0, tempo / 4 * percent)).to.be.true;
            expect(spyPlayer.playNote.calledWith(channel, velocity, 52, 0, tempo / 8 * percent)).to.be.true;
            expect(spyPlayer.playNote.calledWith(channel, velocity, 55, 0, tempo / 8 * percent)).to.be.true;
            expect(spyPlayer.playNote.calledWith(channel, velocity, 53, tempo / 8, tempo / 8 * percent)).to.be.true;
            expect(spyPlayer.playNote.calledWith(channel, velocity, 62, tempo / 4, tempo / 2 * percent)).to.be.true;
            expect(spyPlayer.playNote.calledWith(channel, velocity, 55, tempo / 4, tempo / 4 * percent)).to.be.true;

            done();
        });

    });



    xit('should merge tied notes together', () => {
        const score = new JMusic({content: [['c\'4 d\'2~ d\'4~ <d\' f\'>4']]});
        const velocity = 100;
        const channel = 0;
        const percent = .85;
        const tempo = 3000;

        const midiPerformer = new MidiPerformer();

        const res = midiPerformer.getMusicEvents(score);

        expect(res).to.have.length(3);
        expect(res).to.deep.eq([
            [
                {
                    channel,
                    velocity,
                    pitch: 60,
                    time: tempo * 0,
                    absTime: Time.newAbsolute(0, 1),
                    duration: tempo / 4 * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 62,
                    time: tempo / 4,
                    absTime: Time.newAbsolute(1, 4),
                    duration: tempo * percent
                }
            ],
            [
                {
                    channel,
                    velocity,
                    pitch: 65,
                    time: tempo,
                    absTime: Time.newAbsolute(1, 1),
                    duration: tempo / 4 * percent
                }
            ]
        ]);
    });


});