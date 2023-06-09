import { NoteDirection, cloneNote, voiceContentToSequence } from '../../model';
import { FlexibleItem, FlexibleSequence } from './../score/flexible-sequence';
import { LongDecorationType } from './../decorations/decoration-type';
import { TimeSpan } from './../rationals/time';
import { ISequence, MusicEvent, isClefChange, isKeyChange, isMeterChange, isNote, isStateChange } from './../score/sequence';
import { InsertionPoint } from './../../editor/insertion-point';
import { RegularMeterDef, MeterFactory } from './../states/meter';
import { Key, KeyDef } from './../states/key';
import { Clef, ClefDef } from './../states/clef';
import { RepeatDef } from '../score/repeats';
import { parseLilyClef, parseLilyKey, parseLilyMeter } from '../score/sequence';
import { StaffDef } from '../score/staff';
import { isScoreDef, ScoreDef } from './../score/score';
import { Meter } from '../states/meter';
import { createNoteFromLilypond, Note } from '../notes/note';
import { Alteration, Pitch } from '../pitches/pitch';
import { Time } from '../rationals/time';
import { createStateMap, getStateAt } from '../../logical-view/view-model/state-map';
import { VariableRepository } from '../score/variables';
import R = require('ramda');
import { Enharmonic, addInterval, enharmonicChange } from '../pitches/intervals';
import { StateChange } from '../states/state';

export interface JMusicSettings {
    content: FlexibleItem[][];
    clefs?: (Clef | string)[];
    meter?: Meter | string;
    key?: Key | string;
}

export interface JMusicVars {
    [key: string]: FlexibleItem;
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


export const initStateInSequence = (s: ISequence) => {
    const slots = s.groupByTimeSlots('');
    if (!slots.length) return {};
    const firstSlot = slots[0];
    if (!firstSlot.states) return {};   
    
    const res = {} as any;
    const key = firstSlot.states.find(st => st.key);
    const clef = firstSlot.states.find(st => st.clef);
    const meter = firstSlot.states.find(st => st.meter);

    if (key) res.key = key.key;
    if (clef) res.clef = clef.clef;
    if (meter) res.meter = meter.meter;

    return res;
};

/** Facade object for music scores */
export class JMusic implements ScoreDef {

    constructor(voice?: string | JMusicSettings | ScoreDef, vars?: JMusicVars) {

        this.vars = new VariableRepository(vars ? R.toPairs<FlexibleItem>(vars).map(pair => ({ id: pair[0], value: new FlexibleSequence(pair[1]) })) : []);

        this.makeScore(voice);

        this.staves.forEach(staff => {
            staff.voices.forEach(voice => {
                const states = initStateInSequence(voiceContentToSequence(voice.content));
                if (states.clef) {
                    //console.log('changing clef', staff.initialClef, states.clef);
                    staff.initialClef = states.clef.def;
                }
                if (states.meter) {
                    //console.log('changing meter', staff.initialMeter, states.meter);
                    this.staves.forEach(staff1 => (staff1.initialMeter = states.meter.def));
                }
                if (states.key) {
                    //console.log('changing key', staff.initialKey, states.key);
                    this.staves.forEach(staff1 => (staff1.initialKey = states.key.def));
                }
            });
        });
        //console.log('staves', this.staves);
    }

    staves: StaffDef[] = [];
    repeats?: RepeatDef[] | undefined;
    vars: VariableRepository;

    changeHandlers: ChangeHandler[] = [];

    private makeScore(voice: string | JMusicSettings | ScoreDef | undefined) {
        if (typeof (voice) === 'string') {
            this.staves = [{
                initialClef: Clef.clefTreble.def,
                initialKey: { count: 0, accidental: 0 },
                initialMeter: { count: 4, value: 4 },
                voices: [{ content: new FlexibleSequence(voice, this.vars) }]
            }];
        } else if (isScoreDef(voice)) {
            this.staves = [...voice.staves];
            this.repeats = voice.repeats ?? [];
        } else if (typeof (voice) === 'object') {
            const settings = voice as JMusicSettings;
            this.staves = [];
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
                    voices: stf.map((cnt, idx) => ({
                        content: new FlexibleSequence(cnt, this.vars),
                        noteDirection: stf.length === 1 ? NoteDirection.Undefined : idx % 2 === 0 ? NoteDirection.Up : NoteDirection.Down
                    }))
                });
            });
        }
    }

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
            return parseLilyKey('\\key ' + input.replace(' major', ' \\major').replace(' minor', ' \\minor')).def;
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
            return createNoteFromLilypond(input);
        }
        return input as Note;
    }

    sequenceFromInsertionPoint(ins: InsertionPoint): ISequence {
        return voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content);
    }

    noteFromInsertionPoint(ins: InsertionPoint): Note {
        return voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).groupByTimeSlots('0').filter(ts => Time.equals(ts.time, ins.time))[0].elements[0];
    }

    /*noteEquals(note1: MusicEvent, note2: Note): boolean {
        //console.log(note1, note2);

        return (note1 as Note).pitches === note2.pitches;
    }*/

    InsertElementAtInsertionPoint(ins: InsertionPoint, element: MusicEvent, checkType: (e: MusicEvent) => boolean): void {
        this.staves[ins.staffNo].voices[ins.voiceNo].content = new FlexibleSequence(voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).chainElements(
            (ct, time) => {
                if (!Time.equals(time, ins.time)) return [ct];
                if (checkType(ct)) return [];
                return isNote(ct) ? [element, ct] : [ct];
            }
        ));
    }

    replaceNoteAtInsertionPoint(ins: InsertionPoint, fromNote: Note, toNote: Note): void {
        this.staves[ins.staffNo].voices[ins.voiceNo].content = new FlexibleSequence(voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).chainElements(
            (ct, time) => {
                return [Time.equals(time, ins.time) && isNote(ct) ? toNote : ct];
            }
        ));
    }

    deleteNoteAtInsertionPoint(ins: InsertionPoint, fromNote: Note): void {
        this.staves[ins.staffNo].voices[ins.voiceNo].content = new FlexibleSequence(voiceContentToSequence(this.staves[ins.staffNo].voices[ins.voiceNo].content).filterElements(
            (ct, time) => {
                return !(Time.equals(time, ins.time) && isNote(ct));
            }
        ));
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

    clearScore(ins: InsertionPoint, voice?: string | JMusicSettings | ScoreDef): void {
        //this.staves = 
        this.makeScore(voice);

        this.vars = new VariableRepository([]);

        this.didChange();
    }

    appendNote(ins: InsertionPoint, noteInput: NoteFlex): void {
        const note = JMusic.makeNote(noteInput);
        const seq = this.sequenceFromInsertionPoint(ins);
        seq.appendElement(note);
        this.didChange();
    }

    deleteNote(ins: InsertionPoint): void {
        const note = this.noteFromInsertionPoint(ins);
        this.deleteNoteAtInsertionPoint(ins, note);
        this.didChange();
    }

    setNoteValue(ins: InsertionPoint, time: TimeSpan): void {
        const note = this.noteFromInsertionPoint(ins);
        const note1 = cloneNote(note, { nominalDuration: time });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    addPitch(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        const note = this.noteFromInsertionPoint(ins);
        note.pitches.push(pitch);
        this.didChange();
    }

    setPitches(ins: InsertionPoint, pitches: Pitch[]): void {
        const note = this.noteFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    removePitch(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        //const seq = this.sequenceFromInsertionPoint(ins);
        const note = this.noteFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches: note.pitches.filter(p => p.diatonicNumber !== pitch?.diatonicNumber) });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    changePitchEnharm(ins: InsertionPoint, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        const note = this.noteFromInsertionPoint(ins);
        //const seq = this.sequenceFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches: note.pitches.map(p => {
            return enharmonicChange(p, Enharmonic.BestBet);
        }) });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    alterPitch(ins: InsertionPoint, alteration: number, pitch?: Pitch): void {
        if (!pitch) {
            pitch = this.pitchFromInsertionPoint(ins);
        }
        const note = this.noteFromInsertionPoint(ins);
        //const seq = this.sequenceFromInsertionPoint(ins);
        const note1 = cloneNote(note, { pitches: note.pitches.map(p => {
            if (Math.abs(p.alteration + alteration) >= 3) {
                const pitch = p.pitchClassNumber + alteration;
                if (pitch < 0) return new Pitch(pitch + 7, p.octave - 1, 0);    
                if (pitch >= 7) return new Pitch(pitch - 7, p.octave + 1, 0);    
                return new Pitch(( + 7) % 7, p.octave, 0);    
            }
            return new Pitch(p.pitchClassNumber, p.octave, (p.alteration + alteration) as Alteration);
        }) });
        this.replaceNoteAtInsertionPoint(ins, note, note1);
        this.didChange();
    }

    addLongDecoration(decorationType: LongDecorationType, ins: InsertionPoint, length: TimeSpan): void {
        const seq = this.sequenceFromInsertionPoint(ins);

        seq.insertElement(ins.time, { longDeco: decorationType, length });
        this.didChange();
    }

    addMeterChg(ins: InsertionPoint, meter: MeterFlex): void {
        const m = JMusic.makeMeter(meter);
        
        this.InsertElementAtInsertionPoint(ins, StateChange.newMeterChange(MeterFactory.createRegularMeter(m)), isMeterChange);
        this.didChange();
    }

    addKeyChg(ins: InsertionPoint, key: KeyFlex): void {
        const m = JMusic.makeKey(key);
        
        this.InsertElementAtInsertionPoint(ins, StateChange.newKeyChange(new Key(m)), isKeyChange);
        this.didChange();
    }

    addClefChg(ins: InsertionPoint, clef: ClefFlex): void {
        const m = JMusic.makeClef(clef);
        
        this.InsertElementAtInsertionPoint(ins, StateChange.newClefChange(new Clef(m)), isClefChange);
        this.didChange();
    }

    onChanged(handler: ChangeHandler): void {        
        this.changeHandlers.push(handler);
    }

    didChange(): void {
        this.changeHandlers.forEach(handler => handler());
    }

    getView(varname?: string): JMusic {
        if (varname) {
            return new JMusic({content: [[this.vars.valueOf(varname).elements]]});
        }
        return this;
    }

}