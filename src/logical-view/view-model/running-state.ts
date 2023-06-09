import { RationalDef } from './../../model/rationals/rational';
import { Meter } from './../../model/states/meter';
import { BeamGroup } from './../../model/notes/beaming';
import { AccidentalManager } from './../../model/states/key';
import { FlexibleSequence, getAllBars, TimeSlot, TupletState } from './../../model';
import { AbsoluteTime, Time } from './../../model';
import { NoteViewModel, TupletViewModel } from './note-view-model';
import { Clef } from '../../model';
import { Key } from '../../model';
import { TimeSlotViewModel } from './score-view-model';
import { voiceContentToSequence, VoiceDef } from '../../model/score/voice';
import { createIdPrefix } from './state-map';

/** This object is created for each voice during processing. It keeps track of the current state:
 * * key
 * * meter
 * * clef
 * * upcoming bar lines
 * * tuplets
 * * accidental rules
 */
export class State {
    constructor (
        public voiceBeamGroups: BeamGroup[], 
        public staffNo: number, 
        public voiceNo: number, 
        public voice: VoiceDef, 
        public clef: Clef
    ) {
        const voiceSequence = voiceContentToSequence(voice.content);
        this.voiceTimeSlots = voiceSequence.groupByTimeSlots(createIdPrefix(staffNo, voiceNo));
    }

    public nextBarIterator: IterableIterator<AbsoluteTime> | undefined;
    public nextBar = Time.EternityTime;
    public tupletGroups = [] as TupletViewModel[];
    public tupletGroup: TupletViewModel | undefined;
    public voiceTimeSlots: TimeSlot[];

    
    findNoteTime(uniq: string): AbsoluteTime {
        const slot = this.voiceTimeSlots.find(vts => vts.elements.find(elm => elm.uniq === uniq));
        if (!slot) throw 'Note not found: ' + uniq;
        return slot.time;
    }


    private _voiceTimeSlot: TimeSlot | undefined;
    public get voiceTimeSlot(): TimeSlot {
        if (!this._voiceTimeSlot) throw 'Internal error (voiceTimeSlot)';
        return this._voiceTimeSlot;
    }
    public set voiceTimeSlot(value: TimeSlot) {
        this._voiceTimeSlot = value;

        if (this.nextBarIterator && Time.sortComparison(this.slot.absTime, this.nextBar) >= 0) {
            this.newBar();
            this.nextBar = this.nextBarIterator.next().value;
        }

    }

    private _meter?: Meter;

    private _key?: Key | undefined;
    public get key(): Key | undefined {
        return this._key;
    }
    public set key(value: Key | undefined) {
        if (!value) throw 'Cannot set key to undefined';
        this._key = value;
        this.accidentalManager.setKey(value);
    }
    public slotNo = -1;
    private _slot: TimeSlotViewModel | undefined;
    public get slot(): TimeSlotViewModel {
        if (!this._slot) throw 'Internal error (slot)';
        return this._slot;
    }
    public set slot(value: TimeSlotViewModel) {
        this._slot = value;
    }

    public accidentalManager = new AccidentalManager();

    addNotes(elements: NoteViewModel[]): void {
        this.slot.notes = this.slot.notes.concat(elements);
    }

    get meter(): Meter | undefined { 
        return this._meter; 
    }

    setMeter(meter: Meter, atTime: AbsoluteTime): void {
        this._meter = meter;
        if(meter) {
            this.nextBarIterator = getAllBars(meter, atTime);
            this.nextBar = this.nextBarIterator.next().value;
        }
    }

    newBar(): void {
        this.accidentalManager.newBar();
    }



    updateTupletViewModel(): void {
        this.voiceTimeSlot.elements.forEach((note) => {
            switch (note.tupletGroup) {
                case TupletState.Begin: 
                    if (this.tupletGroup) throw 'Internal Error (createTupletViewModel)';
                    this.tupletGroup = { noteRefs: [], tuplets: [] };
                    if (!this.slot.tuplets) this.slot.tuplets = [];
                    this.slot.tuplets.push(this.tupletGroup);
                    this.tupletGroup.noteRefs.push({absTime: this.voiceTimeSlot.time, uniq: note.uniq + ''});
                    this.tupletGroup.tuplets.push({
                        fromIdx: 0,
                        tuplet: '' + (note.tupletFactor as RationalDef).denominator,
                        toIndex: undefined
                    });
                    break;
                case TupletState.Inside:
                    if (!this.tupletGroup) throw 'Internal Error (createTupletViewModel)';
                    this.tupletGroup.noteRefs.push({absTime: this.voiceTimeSlot.time, uniq: note.uniq + ''});
                    break;
                case TupletState.End: 
                    if (!this.tupletGroup) throw 'Internal Error (createTupletViewModel)';
                    this.tupletGroup.noteRefs.push({absTime: this.voiceTimeSlot.time, uniq: note.uniq + ''});
                    this.tupletGroup.tuplets[0].toIndex = this.tupletGroup.noteRefs.length - 1;
                    this.tupletGroups.push(this.tupletGroup);
                    this.tupletGroup = undefined;
                    break;
            }
        });
    }
    
    


}

