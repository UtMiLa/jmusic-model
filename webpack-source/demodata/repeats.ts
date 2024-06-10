import { NoteType, NoteDirection, StaffDef, ClefType, Time, SimpleSequence } from '../../src/model';


export const repeats = {
    repeats: [
        {from: Time.StartTime, to: Time.newAbsolute(3,1) },
        {from: Time.newAbsolute(4,1), to: Time.newAbsolute(6,1) },
        {from: Time.newAbsolute(6,1), to: Time.newAbsolute(8,1) },
        {from: Time.newAbsolute(21,2), to: Time.newAbsolute(23,2) }
    ],
    staves: [{
        initialClef: { clefType: ClefType.G, line: -2 },
        initialMeter: { count: 4, value: 4 },
        initialKey: { accidental: -1, count: 3 },
        voices:[
            {
                noteDirection: NoteDirection.Up,
                contentDef: 'c\'\'1 d\'\'1 c\'\'1 c\'\'1 c\'\'1 c\'\'1 c\'\'1 c\'\'1 c\'\'2 c\'\'2 c\'\'2 c\'\'2 c\'\'2 c\'\'2 c\'\'2 c\'\'2'
            },
            {
                noteDirection: NoteDirection.Down,
                contentDef: 'c\'1 c\'1 c\'1 c\'1 c\'1 c\'1 c\'1 c\'1 c\'2 c\'2 c\'2 c\'2 c\'2 c\'2 c\'2 c\'2'
            }
        ]
    } as StaffDef,
     {
         initialClef: { clefType: ClefType.F, line: 2 },
         initialMeter: { count: 4, value: 4 },
         initialKey: { accidental: -1, count: 3 },
         voices:[
             {
                 noteDirection: NoteDirection.Down,
                 contentDef: 'c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1 c,1'}
         ]
     } as StaffDef
    ]
};
