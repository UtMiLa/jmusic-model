import { FlexibleItem } from './../model/score/types';
import { scoreModelToViewModel, ScoreViewModel } from '../logical-view';
import { ClefType, Note, RegularMeterDef, ScoreDef, scoreDefToScore, setGrace, SimpleSequence, StaffDef, staffDefToStaff, Time } from './../model';

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

export function createTestStaff(staff: FlexibleItem[], meter: number[], key: number[], clef = 0): StaffDef {
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
        voices: staff.map(v => ({ content: v }))
    } as StaffDef;
}

export function createTestScoreVM(staves: string[][], meter: number[], key: number[], clefs: string[] | undefined = undefined): ScoreViewModel {
    return scoreModelToViewModel(scoreDefToScore(createTestScore(staves, meter, key, clefs)));
}

export function setGraceNoteInSequence(seq: SimpleSequence, elementNo: number): SimpleSequence {
    seq.elements[elementNo] = setGrace(seq.elements[elementNo] as Note, true);
    return seq;
}

/*export function setGraceNoteInStaff(staff: StaffDef, voiceNo: number, elementNo: number): StaffDef {
    voiceContentToSequence(staff.voices[voiceNo].content).elements[elementNo] = setGrace(voiceContentToSequence(staff.voices[voiceNo].content).elements[elementNo] as Note, true);
    return staff;
}*/
