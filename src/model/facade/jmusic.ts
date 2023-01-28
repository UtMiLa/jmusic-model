import { LongDecorationType } from './../decorations/decoration-type';
import { TimeSpan } from './../rationals/time';
import { ISequence } from './../score/sequence';
import { InsertionPoint } from './../../editor/insertion-point';
import { RegularMeterDef } from './../states/meter';
import { Key, KeyDef } from './../states/key';
import { Clef, ClefDef } from './../states/clef';
import { RepeatDef } from '../score/repeats';
import { parseLilyClef, parseLilyKey, parseLilyMeter, SimpleSequence } from '../score/sequence';
import { StaffDef } from '../score/staff';
import { ScoreDef } from './../score/score';
import { Meter } from '../states/meter';
import { Note } from '../notes/note';
import { Pitch } from '../pitches/pitch';
import { Time } from '../rationals/time';
import { createStateMap, getStateAt } from '../../logical-view/view-model/state-map';

export interface JMusicSettings {
    content: string[][];
    clefs?: (Clef | string)[];
    meter?: Meter | string;
    key?: Key | string;
}

/** Tolerant input type for notes: a Note object, or a string in Lilypond format */
export type NoteFlex = Note | string;

/** Tolerant input type for meters: a Meter object, a RegularMeterDef definition, or a string in Lilypond format */
export type MeterFlex = Meter | RegularMeterDef | string;

/** Tolerant input type for clefs: a Clef object, a ClefDef definition, or a string in Lilypond format */
export type ClefFlex = Clef | ClefDef | string;

/** Tolerant input type for key: a Key object, a KeyDef definition, or a string in Lilypond format */
export type KeyFlex = Key | KeyDef | string;

/** Tolerant input type for sequences: a ISequence object, or a string in Lilypond format */
export type SequenceFlex = ISequence | string;

export type ChangeHandler = () => void;

/** Facade object for music scores */
export class JMusic implements ScoreDef {

    constructor(voice?: string | JMusicSettings) {
        if (typeof(voice) === 'string') {
            this.staves.push({ 
                initialClef: Clef.clefTreble.def,
                initialKey: { count: 0, accidental: 0 },
                initialMeter: { count: 4, value: 4 },
                voices: [{ content: new SimpleSequence(voice) }]
            });
        } else if (typeof(voice) === 'object') {
            const settings = voice as JMusicSettings;
            settings.content.forEach((stf, idx) => {
                
                let clef: ClefDef;
                if (settings.clefs) {
                    clef = JMusic.makeClef(settings.clefs[idx]);
                } else if (idx > 0 && idx === settings.content.length - 1) {
                    clef = Clef.clefBass.def;
                } else {
                    clef = Clef.clefTreble.def;
                }                

                const key = settings.key ? JMusic.makeKey(settings.key) : { count: 0, accidental: 0 } as KeyDef;

                const meter = settings.meter ? JMusic.makeMeter(settings.meter) : undefined;

                this.staves.push({ 
                    initialClef: clef,
                    initialKey: key,
                    initialMeter: meter,
                    voices: stf.map(cnt => ({ content: new SimpleSequence(cnt) }))
                });
            });
        }
    }

    staves: StaffDef[] = [];
    repeats?: RepeatDef[] | undefined;

    changeHandlers: ChangeHandler[] = [];

    static makeClef(input: ClefFlex): ClefDef {
        if (typeof (input) === 'string') {
            return parseLilyClef(input).def;
        }
        const cd = input as ClefDef;
        if (cd.clefType !== undefined && cd.line !== undefined ) {
            return cd;
        }
        return (input as Clef).def;
    }

    static makeKey(input: KeyFlex): KeyDef {
        if (typeof (input) === 'string') {
            return parseLilyKey('\\key ' + input).def;
        }
        const cd = input as KeyDef;
        if (cd.accidental !== undefined && cd.count !== undefined ) {
            return cd;
        }
        return (input as Key).def;
    }

    static makeMeter(input: MeterFlex): RegularMeterDef {

        if (typeof (input) === 'string') {
            return parseLilyMeter('\\meter ' + input).def as RegularMeterDef;
        }
        const cd = input as RegularMeterDef;
        if (cd.value !== undefined && cd.count !== undefined ) {
            return cd;
        }
        return (input as Meter).def as RegularMeterDef;
    }

    static makeNote(input: NoteFlex): Note {

        if (typeof (input) === 'string') {
            return Note.parseLily(input);
        }
        return input as Note;
    }

    sequenceFromInsertionPoint(ins: InsertionPoint): ISequence {
        return this.staves[ins.staffNo].voices[ins.voiceNo].content;
    }

    noteFromInsertionPoint(ins: InsertionPoint): Note {
        return this.staves[ins.staffNo].voices[ins.voiceNo].content.groupByTimeSlots('0').filter(ts => Time.equals(ts.time, ins.time))[0].elements[0];
    }

    pitchFromInsertionPoint(ins: InsertionPoint): Pitch {
        const stateMap = createStateMap(this);
        const state = getStateAt(stateMap, ins.time, ins.staffNo);
        if (!state.clef) {
            const clef = this.staves[ins.staffNo].initialClef;
            if (!clef) throw 'Cannot map position without a clef';

            state.clef = new Clef(clef);
        }
        
        return state.clef.mapPosition(ins.position);
    }

    appendNote(ins: InsertionPoint, noteInput: NoteFlex): void {
        const note = JMusic.makeNote(noteInput);
        const seq = this.sequenceFromInsertionPoint(ins);
        seq.elements.push(note);
        this.didChange();
    }

    addPitch(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        const seq = this.sequenceFromInsertionPoint(ins);
        const note = this.noteFromInsertionPoint(ins);
        note.pitches.push(pitch);
        this.didChange();
    }


    addLongDecoration(decorationType: LongDecorationType, ins: InsertionPoint, length: TimeSpan): void {
        const seq = this.sequenceFromInsertionPoint(ins);

        seq.insertElement(ins.time, { longDeco: decorationType, length, duration: Time.NoTime });
        this.didChange();
    }

    onChanged(handler: ChangeHandler): void {        
        this.changeHandlers.push(handler);
    }

    didChange(): void {
        this.changeHandlers.forEach(handler => handler());
    }

}