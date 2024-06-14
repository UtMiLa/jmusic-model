import EventEmitter = require('events');
import { Command, MidiEvent, MidiInService } from './entry';
import { TapEntry, TapEntryScore } from './tap-entry';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import { Time, createNote, createNoteFromLilypond } from '../model';

class MidiInServiceMock implements MidiInService {
    events = new Subject<MidiEvent>();

    simulateEvents(eventString: string): void {
        eventString.split(' ').forEach(element => {
            if (element === 'tap') {
                this.events.next({
                    controller: 1,
                    value: 100
                });
            } else if (element === 'tapx') {
                this.events.next({
                    controller: 2,
                    value: 100
                });
            } else {
                const pitch = Number.parseInt(element);
                if (pitch > 0) {
                    this.events.next({
                        pitch: pitch,
                        velocity: 100
                    });
                } else {
                    this.events.next({
                        pitch: -pitch,
                        velocity: 0
                    });
                }
                
            }
        });
    }
}

describe('Tap-entry', () => {

    let midiMock: MidiInServiceMock;

    let tapEntry: TapEntry;
    let commands: Command[];
    let score: TapEntryScore;

    beforeEach(() => {
        midiMock = new MidiInServiceMock();
    });

    function expectInputOutput(input: string, noVoices: number, output: string[]) {
        score = new TapEntryScore({ count: 5, value: 4}, Time.QuarterTime, noVoices);
        tapEntry = new TapEntry(score);
        commands = [];

        tapEntry.commandGenerator.subscribe((cmd: Command) => { 
            commands.push(cmd);
        });

        tapEntry.subscribeMidi(midiMock);

        midiMock.simulateEvents(input);

        //console.log(score);

        expect(score.voices).to.deep.eq(output);
        /*output.forEach(voice => {
            const voiceRes = voice.split(' ').map(note => ({
                command: 'AppendNote',
                data: createNoteFromLilypond(note)
            }));
            expect(commands).to.deep.eq(voiceRes);
        });        */
    }

    it('should generate notes of the same length', () => {
        expectInputOutput('+60 -60 +62 -62', 1, ['c\'4 d\'4 ']);
    });

    it('should extend length when tapping', () => {
        expectInputOutput('+60 tap tap -60 +62 tap -62', 1, ['c\'2. d\'2 ']);
    });

    it('should create rests when tapping without notes', () => {
        expectInputOutput('+60 -60 tap tap +62 -62 tap', 1, ['c\'4 r2 d\'4 r4 ']);
    });

    it('should split chords in voices', () => {
        expectInputOutput('+60 +64 -64 -60 +65 +62 -62 -65', 2, ['e\'4 f\'4 ', 'c\'4 d\'4 ']);
    });

    it('should extend length on some notes when left-tapping', () => {
        expectInputOutput('+60 +64 -64 tapx +65 -60 -65', 2, ['e\'4 f\'4 ', 'c\'2 ']);
    });

    it('should delete last note when left-tapping', () => {
        expectInputOutput('+60 +64 -64 -60 +65 +60 -60 -65 tapx', 2, ['e\'4 ', 'c\'4 ']);
    });
});
