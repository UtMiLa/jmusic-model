import R = require('ramda');
import { JMusic, isNote, Rational, getDuration, AbsoluteTime, TimeSlot, MusicEvent, voiceContentToSequence } from '../../model';
import { Subject } from 'rxjs';

/* Todo:
 * Tied notes should be joined together
 * Voices in different channels
 * Grace notes should have some fixed, short value
 * Tempo changes should be considered
 * Extra velocity on strong beats (in some inherited, more advanced class)
 * Program presets and changes
 * Note decorations (staccato, marcato, fermata, trills) should be considered (in some inherited, more advanced class)
 * When page is out of focus, setTimeout is bad
 * Playback repeats
 */

interface InternalMidiEvent {
    time: number;
    absTime: AbsoluteTime;
    duration: number;
    pitch: number;
    channel: number;
    velocity: number;
  }

export interface MidiPlayer {
    playNote(channel: number, velocity: number, pitch: number, startTime: number, duration: number): void;
}
  

export interface MidiPerformerSettings {
    tempo?: number;
    percent?: number;
    channel?: number;
    velocity?: number;
}
export interface MidiPerformerSettingsNotNull {
    tempo: number;
    percent: number;
    channel: number;
    velocity: number;
}

export function splitPitches(slots: TimeSlot[]): TimeSlot[] {
    //console.log('splitPitches(', slots);
    return R.chain(slot => R.unwind('elements', slot), slots).map((x: any) => ({...x, elements: [x.elements]}));
}

export function combineTiedNotes(slots: TimeSlot[]): TimeSlot[] {
    //console.log('combineTiedNotes(', slots);
    return R.reduce((prev, curr) => { return [...prev, curr]; }, [] as TimeSlot[], slots);
}

export class MidiPerformer {
    constructor(settings: MidiPerformerSettings = {}) {
        this.settings = { tempo: 3000, percent: .85, channel: 0, velocity: 100, ...settings };
    }
    private settings: MidiPerformerSettingsNotNull;

    moveCursor = new Subject();

    elementToEvent(element: MusicEvent, time: AbsoluteTime): InternalMidiEvent[] {
        if (isNote(element)) {
            const pitches = element.pitches.map(pitch => pitch.midi);
            
            return pitches.map(pitch => ({
                time: Rational.value(time) * this.settings.tempo,
                absTime: time,
                duration: Rational.value(getDuration(element)) * this.settings.tempo * this.settings.percent,
                pitch,
                channel: this.settings.channel,
                velocity: this.settings.velocity
            }));
        }
        return [];
    }
    
    getMusicEvents(model: JMusic): InternalMidiEvent[][] {
        let allEvents: InternalMidiEvent[] = [];
  
        model.staves.forEach(staff => {
  
            staff.voices.forEach(voice => {
                const timeslots = combineTiedNotes(splitPitches(voiceContentToSequence(voice.content).groupByTimeSlots('')));

                //console.log('timeslots', timeslots[0]);
                //let rememberTiedPitches = [];

                timeslots.forEach(slot => {
                    allEvents = [...allEvents, ...R.chain(element => this.elementToEvent(element, slot.time), slot.elements)];
                });
  
            });
        });

        return R.groupWith(
            (a: InternalMidiEvent, b: InternalMidiEvent) => (a.time === b.time),
            R.sortBy(R.prop('time'), allEvents)
        );
    }

    *getMusicEventsByTime(model: JMusic): Generator<InternalMidiEvent[]> {
        for (const events of this.getMusicEvents(model)) {
            yield events;
        }
    }
  
    perform(model: JMusic, player: MidiPlayer, done?: () => void): void {
        const itr = this.getMusicEventsByTime(model);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        function iterate(lastTime: number): void {
            const evts = itr.next();
            
            if (!evts.done) {
                setTimeout(() => {
                    self.moveCursor.next((evts.value[0] as InternalMidiEvent).absTime);
                    
                    evts.value.forEach(event => {
                        player.playNote(event.channel, event.velocity, event.pitch, 0, event.duration);
                        //console.log('playNote');
                    });
                    iterate((evts.value[0] as InternalMidiEvent).time);
                }, (evts.value[0] as InternalMidiEvent).time - lastTime);
            } else {
                //console.log('Done');
                if (done) {
                    done();                    
                }
            }
        }

        iterate(0);

    }
}
  