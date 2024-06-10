import { NoteType, LyricsSequence, NoteDirection, StaffDef, ClefType, Time, SimpleSequence, voiceSequenceToDef } from '../../src/model';


export const lyrics = {
    staves: [{
        initialClef: { clefType: ClefType.G, line: -2 },
        initialMeter: { count: 4, value: 4 },
        initialKey: { accidental: -1, count: 0 },
        voices:[
            {
                //noteDirection: NoteDirection.Up,
                contentDef: voiceSequenceToDef(new LyricsSequence(
                    new SimpleSequence( 'c\'8 d\'16 e\'16 f\'4 g\'4 c\'\'8 d\'\'16 e\'\'16 f\'\'4 g\'\'4'),
                    'Hvad skal jeg si- ge, når jeg _ vand- rer?'
                ))
            }
        ]
    } as StaffDef

    ]
};
