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
        score = new TapEntryScore({ count: 5, value: 4}, Time.QuarterTime, 1);
        tapEntry = new TapEntry(score);
        commands = [];

        tapEntry.commandGenerator.subscribe((cmd: Command) => { 
            commands.push(cmd);
        });

        tapEntry.subscribeMidi(midiMock);
    });

    function expectInputOutput(input: string, output: string[]) {
        midiMock.simulateEvents(input);

        console.log(score);

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

        expectInputOutput('+60 -60 +62 -62', ['c\'4 d\'4 ']);
        /*midiMock.simulateEvents('+60 -60 +62 -62');

        expect(commands).to.deep.eq([{
            command: 'AppendNote',
            data: createNoteFromLilypond('c\'4')
        }, {
            command: 'AppendNote',
            data: createNoteFromLilypond('d\'4')
        }]);*/
    });

    it('should extend length when tapping', () => {
        expectInputOutput('+60 tap tap -60 +62 tap -62', ['c\'2. d\'2 ']);
    });

    it('should create rests when tapping without notes', () => {
        //
    });

    it('should split chords in voices', () => {
        //
    });

    it('should extend length on some notes when tapping', () => {
        //
    });

});
