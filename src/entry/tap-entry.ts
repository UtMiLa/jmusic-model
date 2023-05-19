import { Pitch } from './../model/pitches/pitch';
import EventEmitter = require('events');
import { Command, EntryChord, EntryNote, EntryProcessor, EntryRest, KeyboardService, MidiInService, isMidiNoteEvent } from './entry';
import { Observable, Subject } from 'rxjs';
import { RegularMeterDef, Time, TimeSpan, createNote } from '../model';
import { EmptyTapEntryState, TapEntryState } from './tap-entry-state';

const defaultDuration = Time.newSpan(1,4);

export class TapEntryScore {
    constructor (public meter: RegularMeterDef, public counter: TimeSpan, public voiceCount: number) {
        this.voices = [];
        for(let i = 0; i < voiceCount; i++) {
            this.voices.push('');
        }
    }

    voices: string[];

    chords: (EntryChord | EntryRest)[] = [];

    addChord(chord: EntryChord): void {
        //console.log('addChord', chord);

        this.chords.push(chord.deepCopy());
        this.calcVoices();
    }

    removeLast(): void {
        this.chords.pop();
        this.calcVoices();
    }

    addRest(time: TimeSpan): EntryRest {
        //this.chords.push(chord.deepCopy());
        const rest = new EntryRest(time);
        this.chords.push(rest);
        this.calcVoices();
        return rest;
    }

    addTies(pitches: Pitch[]): void {
        //this.chords.push(pitches);
        if(this.chords.length) {
            const lastChord = this.chords[this.chords.length - 1] as EntryChord;
            pitches.forEach(pitch => {
                const note = lastChord.find(pitch);
                if (note) {
                    note.tie = true;
                }
            });
        }
        this.calcVoices();
    }

    calcVoices() {
        // nulstil stemmer
        const voices: (EntryNote | EntryRest)[][] = [];
        this.voices = [];
        for(let i = 0; i < this.voiceCount; i++) {
            voices.push([]);
        }
        // alle chords: estimer stemmer for alt andet ens unisone
        let lastChord: EntryChord;
        this.chords.forEach((chord) => {
            //console.log('(chord as Chord).add', (chord as Chord).add);
            if ((chord as EntryChord).add !== undefined) {
                // Chord
                lastChord = chord as EntryChord;
                lastChord.sort();
                let voice = 0;
                lastChord.forEach((note, index) => {
                    //console.log('foreach note', note);
                    if (voice >= voices.length) return;
                    for (let i = 0; i < note.refCount; i++) {
                        voices[voice].push(note.deepCopy());
                        voice++;
                    }
                },
                voices.length);
            } else {
                // rest
                voices.forEach(voice => {
                    voice.push(chord.deepCopy() as EntryRest);
                });
            }
        });
        //console.log('chords', this.chords, voices);

        /*
        // hver tie:
            // find samling af noder i foregående og efterfølgende akkord
            // hvis én af dem er ikke-unison, vælges denne stemme.
                // så bindes stemme x til stemme x
            // ellers bindes begge unisone stemmer sammen (?)
        */

        // alle ties: bind til fra- og tilnode
        // alle unisoner med binding: tag stemme fra modpart
        // her bør alle noder have stemme
        // fordel noder på stemmer
        voices.forEach((voice, index) => {
            this.voices[index] = '';
            let pushNote: EntryNote | null;
            //console.log('voices');

            voice.forEach(note => {
                const n1 = note.deepCopy();
                //console.log('voices', pushNote, n1);
                if (pushNote) {
                    if (pushNote.pitch && n1.pitch && pushNote.pitch.scientific === n1.pitch.scientific) {
                        n1.addDuration(pushNote.duration);
                    } else {
                        pushNote.tie = false;
                        this.voices[index] += pushNote.toString();
                    }
                    pushNote = null;
                }
                if (n1.tie) {
                    pushNote = n1;
                } else {
                    this.voices[index] += n1.toString();
                }

            });
        });
        // bundne noder sammenlægges
    }

}

export class TapEntry implements EntryProcessor {
    constructor(public score: TapEntryScore) {
        if (!score) {
            this.score = new TapEntryScore({ count: 5, value: 4}, defaultDuration, 4);
        }
        this.state = new EmptyTapEntryState(this.score);
    }

    state: TapEntryState;
    notesPressed: number[] = [];

    subscribeMidi(midiIn: MidiInService): void {
        midiIn.events.subscribe((event => {
            if (isMidiNoteEvent(event)) {
                if (event.velocity === 0) {
                    this.noteOff(event.pitch, 0);
                } else {
                    this.noteOn(event.pitch, 0);
                }
            } else {
                // tap
                if (event.value) {
                    this.controlOn(event.controller, event.value);
                } else {
                    this.controlOff(event.controller, event.value);
                }                
            }
        }));
    }
    subscribeKeyboard(kbdIn: KeyboardService): void {
        throw new Error('Method not implemented.');
    }
    commandGenerator = new Subject<Command>();

    noteOn(note: number, velocity: number): void {
        this.notesPressed.push(note);
        console.log('noteOn', this.notesPressed);
        this.state = this.state.noteOn(note, this.notesPressed);
    }
    noteOff(note: number, velocity: number): void {
        const i = this.notesPressed.indexOf(note);
        if (i > -1) {
            this.notesPressed.splice(i, 1);
        }
        //console.log('noteOff', this.notesPressed);

        this.state = this.state.noteOff(note, this.notesPressed);
        /*this.commandGenerator.next({
            command: 'AppendNote',
            data: createNote([Pitch.fromMidi(note)], Time.QuarterTime)
        });*/

    }
    controlOn(control: number, value: number): void {
        if (control === 1) {
            // prolong
            this.state = this.state.p1On(this.notesPressed);
        } else if (control === 2) {
            // prolong
            this.state = this.state.p2On(this.notesPressed);
        }
    }
    controlOff(control: number, value: number): void {
        //
    }


}