import { NoteType, NoteDirection, StaffDef, ClefType, Time, SimpleSequence } from '../../src/model';


export const beamModel = {
    staves: [{
        initialClef: { clefType: ClefType.G, line: -2 },
        initialMeter: { count: 4, value: 4 },
        initialKey: { accidental: -1, count: 0 },
        voices:[
            {
                noteDirection: NoteDirection.Up,
                contentDef: 'c\'8 d\'16 e\'16 f\'16 g\'16 a\'16. b\'32 a\'16 g\'32 f\'32 g\'16 f\'32 e\'32 d\'8 c\'16. c\'32 \\clef C ' +
             'b8. b16 b8 r8 b8.. b32 b16 b8 b16 b16. b32 b32 b32 b16' //
            }
        ]
    } as StaffDef

    ]
};
