import { JMusicSettings, SeqFunction } from '../../src/model';

export const tupletVars = {
    scale: ['c\'8 d\'8 e\'8 f\'8 g\'8 a\'8'],
    bass: [{ function: 'Repeat', args: ['c4 d4'], extraArgs: [5] } as SeqFunction],
    soprano: ['c\'\'8 c\'\'8 c\'\'8 c\'\'8 c\'\'8']
};

export const tuplets = {
    content: [
        [
            [
                { function: 'Tuplet', args: {variable: 'soprano'}, extraArgs: [{ numerator: 4, denominator: 5 }] },
                { function: 'Transpose', args: [{variable: 'scale'}], extraArgs: [{interval: 2, alteration: -1}] }
            ],
            [
                { function: 'Reverse', args: [
                    { function: 'Tuplet', args: {variable: 'scale'}, extraArgs: [{ numerator: 2, denominator: 3 }] }
                ] },
                {variable: 'scale'},
                { function: 'Transpose', args: [{variable: 'scale'}], extraArgs: [{interval: 2, alteration: -1}] }
            ]
        ],
        [{variable: 'bass'}]
    ],
    clefs: ['treble', 'bass'],
    meter: '4/4',
    key: 'ees \\major'

} as JMusicSettings;
