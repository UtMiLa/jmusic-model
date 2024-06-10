//import { InsertionPoint } from 'jmusic-model/editor/insertion-point';
import { NoteType, NoteDirection, StaffDef, ClefType, Time, SimpleSequence, JMusic, CompositeSequence, GraceSequence, voiceSequenceToDef } from '../../src/model';
//import { LongDecorationType } from 'jmusic-model/model/decorations/decoration-type';


export const grace = {
    staves: [{
        initialClef: { clefType: ClefType.G, line: -2 },
        initialMeter: { count: 4, value: 4 },
        initialKey: { accidental: -1, count: 0 },
        voices:[
            {
                noteDirection: NoteDirection.Up,
                contentDef: voiceSequenceToDef(new CompositeSequence(
                    new SimpleSequence( 'c\'4'),
                    new GraceSequence( new SimpleSequence('d\'16 e\'16')),
                    new SimpleSequence( 'f\'4 g\'4 c\'\'8 d\'\'8'),
                    new GraceSequence( new SimpleSequence( 'e\'\'16')),
                    new SimpleSequence( 'f\'\'4 g\'\'4 f\'\'4 f\'\'4 c\'\'16'),
                    new GraceSequence( new SimpleSequence('d\'16 ees\'32 fis\'32 g\'16')),
                    new SimpleSequence( 'f\'16'),
                    new GraceSequence( new SimpleSequence( 'e\'\'16')),
                    new SimpleSequence( 'f\'\'16 g\'\'16')
                ))
            },{
                noteDirection: NoteDirection.Down,
                contentDef: 'f4 g4 f4 f4 f4 g4 f4 f4'
            }
        ]
    } as StaffDef

    ]
};
