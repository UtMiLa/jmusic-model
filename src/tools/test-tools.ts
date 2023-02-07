import { scoreModelToViewModel, ScoreViewModel } from '../logical-view';
import { ClefType, cloneNote, Note, RegularMeterDef, ScoreDef, SimpleSequence, StaffDef, Time, UpdateNote } from './../model';

export function createTestScore(staves: string[][], meter: number[], key: number[], clefs: string[] | undefined = undefined): ScoreDef {
    return {
        staves: staves.map((staff, no) => {
            let clef = no % 2;
            if (clefs) {
                clef = ['treble', 'bass'].indexOf(clefs[no]);
            }
            return createTestStaff(staff, meter, key, clef);
        })
    } as ScoreDef;
}

export function createTestStaff(staff: string[], meter: number[], key: number[], clef = 0): StaffDef {
    let meterVal = undefined;
    if (meter && meter.length >= 2) {
        meterVal = { count: meter[0], value: meter[1] } as RegularMeterDef;
        if (meter.length === 4) {
            meterVal.upBeat = Time.newSpan(meter[2], meter[3]);
        }
    }

    return {
        initialClef: clef ? { clefType: ClefType.F, line: 2 } : { clefType: ClefType.G, line: -2 },
        initialKey: { accidental: key[0], count: key[1] },
        initialMeter: meterVal,
        voices: staff.map(v => ({ content: new SimpleSequence(v) }))
    } as StaffDef;
}

export function createTestScoreVM(staves: string[][], meter: number[], key: number[], clefs: string[] | undefined = undefined): ScoreViewModel {
    return scoreModelToViewModel(createTestScore(staves, meter, key, clefs));
}

export function setGraceNoteInSequence(seq: SimpleSequence, elementNo: number): SimpleSequence {
    seq.elements[elementNo] = cloneNote(seq.elements[elementNo] as Note, { grace: true });
    return seq;
}

export function setGraceNoteInStaff(staff: StaffDef, voiceNo: number, elementNo: number): StaffDef {
    staff.voices[voiceNo].content.elements[elementNo] = cloneNote(staff.voices[voiceNo].content.elements[elementNo] as Note, { grace: true });
    return staff;
}
