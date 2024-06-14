import { NoteType, NoteDirection, StaffDef, ClefType, Time, SimpleSequence, PitchClass } from '../../src/model';


export const meterModel = {
    staves: [{
        initialClef: { clefType: ClefType.G, line: -2 },
        initialMeter: { meters: [ { count: 3, value: 8 }, { count: 3, value: 8 }, { count: 2, value: 8 }], commonDenominator: true },
        initialKey: { alterations: [new PitchClass(3, 1), new PitchClass(6, -1), new PitchClass(2, -1)] },
        voices:[
            {
                noteDirection: NoteDirection.Up,
                contentDef: 'c\'8 d\'8 ees\'8 fis\'8 g\'8 a\'8 bes\'8 c\'\'8 ' +
                  '\\meter 4/4 \\key d \\major c\'8 c\'8 c\'8 c\'8 c\'8 c\'8 c\'8 c\'8 ' +
                  '\\compoundMeter #\'((2 2) (1 8)) c\'8 cis\'8 c\'8 ces\'8 c\'8 c\'8 c\'8 c\'8 c\'8 ' +
                  '\\meter 6/8 \\key c \\major c\'8 c\'8 c\'8 c\'8 c\'8 c\'8 ' +
                  '\\meter 3/4 c\'8 c\'8 c\'8 c\'8 c\'8 c\'8'
            }
        ]
    } as StaffDef

    ]
};
