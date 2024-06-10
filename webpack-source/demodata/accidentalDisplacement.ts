import { NoteType, NoteDirection, StaffDef, ClefType, Time, SimpleSequence } from '../../src/model';




const chord1 = '<fis gis>4 <fis ais>4 <fis bes>4 <fis, cis>4 <fis, dis>4 <fis, ees>4 <fis, fis>4 <fis, gis>4 <fes, aes>4';
const chord2 = '<fis, ais, cis>4 <ais, dis fis>4 <fis, ais, ees>4 <fis, cis fis>4 <fis, ges, bes,>4 <fis, ges, fis>4 <fis, aes, bes,>4 <fis, ees fis>4';
const chord3 = '<fis, ais, cis fis>4 <fes, aes, des ges>4 <dis, gis, dis fis>4 <aes,, ees, ces aes>4 <ges, bes, ces ees>4 <ges, bes, des ees>4 <ees, ges, bes, des ees>4 <des, fes, aes, ces ees>4 <dis, fis, bes, dis fis>4 <ges, bes, des ees ges>4 <des, fes, aes, des fes aes>4';


export const accidentalTest = {
    staves: [{
        initialClef: { clefType: ClefType.F, line: 2 },
        initialMeter: { count: 2, value: 8, upBeat: Time.newSpan(1, 8) },
        initialKey: { accidental: -1, count: 0 },
        voices:[
            {
                noteDirection: NoteDirection.Up,
                contentDef: chord1
                //'c\'\'8 c\'\'2. e\'\'1 r4 g\'\'4'

            }
        ]
    } as StaffDef,
     {
         initialClef: { clefType: ClefType.F, line: 2 },
         initialMeter: { count: 2, value: 8, upBeat: Time.newSpan(1, 8) },
         initialKey: { accidental: -1, count: 0 },
         voices:[
             {
                 noteDirection: NoteDirection.Up,
                 contentDef: chord2
                 //'c\'\'8 c\'\'2. e\'\'1 r4 g\'\'4'

             }
         ]
     } as StaffDef,
  {
      initialClef: { clefType: ClefType.F, line: 2 },
      initialMeter: { count: 2, value: 8, upBeat: Time.newSpan(1, 8) },
      initialKey: { accidental: -1, count: 0 },
      voices:[
          {
              noteDirection: NoteDirection.Up,
              contentDef: chord3
              //'c\'\'8 c\'\'2. e\'\'1 r4 g\'\'4'

          }
      ]
  } as StaffDef
    ]
};
