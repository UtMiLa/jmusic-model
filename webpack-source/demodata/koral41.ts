import { NoteType, NoteDirection, StaffDef, ClefType, Time, SimpleSequence, LyricsSequence, voiceSequenceToDef } from '../../src/model';


export const koral41 = {
    staves: [{
        initialClef: { clefType: ClefType.G, line: -2 },
        initialMeter: { count: 6, value: 8, upBeat: Time.newSpan(1, 8) },
        initialKey: { accidental: -1, count: 3 },
        voices:[
            {
                noteDirection: NoteDirection.Up,
                contentDef: voiceSequenceToDef(new LyricsSequence( new LyricsSequence( new SimpleSequence(
                    'bes\'8 bes\'4 bes\'8 aes\'8 g\'8 f\'8 ees\'4 g\'8 f\'4 bes8 g\'8. g\'16 aes\'8 bes\'8 c\'\'8 bes\'8 aes\'4. g\'4 bes\'8 f\'4 aes\'8 g\'8 ees\'8 bes\'8 f\'8. g\'16 aes\'8 g\'4 g\'8 g\'8 f\'8 g\'8 a\'8 g\'8 a\'8 c\'\'4. bes\'8 r8 bes\'8 ees\'\'8. ees\'\'16 d\'\'8 c\'\'8 g\'8 aes\'8 bes\'8 c\'\'8 aes\'8 g\'4 g\'8 c\'\'4 bes\'8 aes\'8 c\'8 f\'8 ees\'4. d\'4. ees\'4.~ ees\'4'),
                //'c\'\'8 c\'\'2. e\'\'1 r4 g\'\'4'
                'Den mør- ke nat _ for- gang- en er, og dag- en op- rin- der så vi- de, nu skin- ner sol ov- er mark _ og kær, de fug- le de sjun- ge så bli- de. Gud gi- ve os lyk- ke og go- - de råd, sin nå- des lys os til- sen- - de!'
                ),
                'Gud væ- re lo- vet i e- vig- hed, han den- - ne nat tog os va- re! Han ly- se på os sin hel- li- ge fred og fri os af al- - skens fa- re! Gud gi- ve os lyk- ke og go- - de råd, sin nå- des lys os til- sen- - de!'))
            },
            {
                noteDirection: NoteDirection.Down,
                contentDef:
              'd\'8 ees\'4 g\'8 ees\'4 d\'8 ees\'8 bes8 c\'8 d\'4 bes8 ees\'2. ees\'4 f\'8 ees\'4 ees\'8 ees\'4 d\'8 ees\'4 ees\'8 ees\'4 d\'8 ees\'4 f\'8 ees\'8 d\'8 ees\'8 ees\'4 ees\'8 ees\'4. d\'8 r8 bes\'8 ees\'4 aes\'8 g\'4 ees\'8 f\'8 c\'8 d\'8 ees\'4 cis\'8 c\'4 cis\'8 c\'4 c\'8 bes2. bes4.~ bes4'
                //'c\'8 c\'4 c\'8 c\'8 c\'4 c\'4 <c\' d\'>4 e\'2.. e\'\'8 <b\' d\'\'>64 <a\' c\'\'>32 <g\' b\'>16'
            }
        ]
    } as StaffDef,
     {
         initialClef: { clefType: ClefType.F, line: 2 },
         initialMeter: { count: 6, value: 8, upBeat: Time.newSpan(1, 8) },
         initialKey: { accidental: -1, count: 3 },
         voices:[
             {
                 noteDirection: NoteDirection.Up,
                 contentDef:
            'f8 g4 ees8 c\'8 bes8 aes8 g4 a8 bes4 bes8 bes2. c\'4 bes8 bes4 bes8 c\'4 bes8 bes8 g8 bes8 c\'4 aes8 bes4 b8 c\'4 c\'8 c\'8 bes8 c\'8 a4. bes8 r8 bes8 bes4 b8 c\'4 c\'8 f8 g8 b8 c\'4 ees8 ees4 e8 f4 aes8 g4. aes4. g4.~ g4'
             },
             {
                 noteDirection: NoteDirection.Down,
                 contentDef: 'bes,8 ees4 ees8 ees4. ees4. bes,4 bes8 ees4 f8 g8 aes8 g8 c4 d8 ees4 g,8 aes,4 bes,8 ees4 g8 aes8. g16 f8 ees4 d8 c4. f4 f8 f4. bes,8 r8 bes8 g4 f8 ees4 c8 d8 ees8 f8 c4 bes,8 aes,4.~ aes,4 f,8 bes,2. ees,4.~ ees,4'
             }
         ]
     } as StaffDef
    ]
};
