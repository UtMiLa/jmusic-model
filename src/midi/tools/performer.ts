import R = require('ramda');
import { JMusic, isNote, Rational, getDuration } from '../../model';

interface InternalMidiEvent {
    time: number;
    duration: number;
    pitches: number[];
    channel: number;
    velocity: number;
  }

export interface MidiPlayer {
    playNote(channel: number, velocity: number, pitches: number[], startTime: number, duration: number): void;
}
  
export class MidiPerformer {
    constructor() {
        //
    }
    tempo = 3000;
    percent = .85;

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
                                time: Rational.value(slot.time) * this.tempo,
                                duration: Rational.value(getDuration(element)) * this.tempo * this.percent,
                                pitches,
                                channel: 0,
                                velocity: 100
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
  
    perform(model: JMusic, player: MidiPlayer): void {
  
        
        this.getMusicEvents(model).forEach(eventGroup => {
            eventGroup.forEach(event => {
                player.playNote(event.channel, event.velocity, event.pitches, event.time, event.duration);
            });
        });
    }
}
  