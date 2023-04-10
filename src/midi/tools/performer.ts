import R = require('ramda');
import { JMusic, isNote, Rational, getDuration, AbsoluteTime } from '../../model';
import { Subject } from 'rxjs';


interface InternalMidiEvent {
    time: number;
    absTime: AbsoluteTime;
    duration: number;
    pitches: number[];
    channel: number;
    velocity: number;
  }

export interface MidiPlayer {
    playNote(channel: number, velocity: number, pitches: number[], startTime: number, duration: number): void;
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
export class MidiPerformer {
    constructor(settings: MidiPerformerSettings = {}) {
        this.settings = { tempo: 3000, percent: .85, channel: 0, velocity: 100, ...settings };
    }
    private settings: MidiPerformerSettingsNotNull;

    moveCursor = new Subject();

    getMusicEvents(model: JMusic): InternalMidiEvent[][] {
        const allEvents: InternalMidiEvent[] = [];
  
        model.staves.forEach(staff => {
  
            staff.voices.forEach(voice => {
                const timeslots = voice.content.groupByTimeSlots('');
  
                timeslots.forEach(slot => {
                    slot.elements.forEach(element => {
                        if (isNote(element)) {
                            const pitches = element.pitches.map(pitch => pitch.midi);
  
                            allEvents.push({
                                time: Rational.value(slot.time) * this.settings.tempo,
                                absTime: slot.time,
                                duration: Rational.value(getDuration(element)) * this.settings.tempo * this.settings.percent,
                                pitches,
                                channel: this.settings.channel,
                                velocity: this.settings.velocity
                            });
                        }
                    });
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
                        player.playNote(event.channel, event.velocity, event.pitches, 0, event.duration);
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
  