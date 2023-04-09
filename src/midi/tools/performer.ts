import R = require('ramda');
import { JMusic, isNote, Rational, getDuration } from '../../model';

export interface MidiPlayer {
    playNote(channel: number, velocity: number, pitches: number[], startTime: number, duration: number): void;
  }
  
export class MidiPerformer {
    constructor() {
        //
    }
    tempo = 3000;
    percent = .85;
  
    perform(model: JMusic, player: MidiPlayer) {
  
        const allEvents: {
        time: number;
        duration: number;
        pitches: number[];
        channel: number;
        velocity: number;
      }[] = [];
  
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
                            //player.playNote(0, 100, pitches, Rational.value(slot.time) * this.tempo, Rational.value(getDuration(element)) * this.tempo * this.percent);
                        }
                    });
                });
  
                /*let startTime = Time.StartTime;
          voice.content.elements.forEach(element => {
            if (isNote(element)) {
              const pitches = element.pitches.map(pitch => pitch.midi);
              player.playNote(0, 100, pitches, Rational.value(startTime) * this.tempo, Rational.value(getDuration(element)) * this.tempo * this.percent);
              startTime = Time.addTime(startTime, getDuration(element));
            }
          });*/
            });
        });
  
        R.sortBy(R.prop('time'), allEvents).forEach(event => {
            player.playNote(event.channel, event.velocity, event.pitches, event.time, event.duration);
        });
    }
}
  