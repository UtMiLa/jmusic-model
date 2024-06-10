import { NoteType, NoteDirection, StaffDef, ClefType, Time, SimpleSequence } from '../../src/model';


export const expressions = {
    staves: [{
        initialClef: { clefType: ClefType.G, line: -2 },
        initialMeter: { count: 4, value: 4 },
        initialKey: { accidental: -1, count: 0 },
        voices:[
            {
                //noteDirection: NoteDirection.Up,
                contentDef:  'c\'8\\staccato d\'16\\staccatissimo e\'16\\tenuto f\'4\\prall\\fermata g\'4\\trill c\'\'8\\staccato d\'\'16\\staccatissimo e\'\'16\\tenuto f\'\'4\\prall\\fermata g\'\'4\\trill' //
            }
        ]
    } as StaffDef

    ]
};
