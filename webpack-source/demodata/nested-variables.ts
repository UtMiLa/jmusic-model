import { CompositeSequence, FlexibleSequence, JMusic, JMusicSettings, SeqFunction } from '../../src/model';

export const nestedVariableVars = {
    scale: ['c\'8 d\'8 e\'8 f\'8 g\'8 a\'8'],
    bass: [{ function: 'Repeat', args: ['c4 d4'], extraArgs: [5] } as SeqFunction],
    soprano: ['c\'\'8 c\'\'8 c\'\'8 c\'\'8 c\'\'8']
};

export const nestedVariables = {
    content: [
        [
            [
                {variable: 'soprano'},
                {variable: 'scale'}
            ],
            [
                'c4',
                {variable: 'scale'},
                'd4',
                {variable: 'scale'},
                'ees4',
                {variable: 'scale'}
            ]
        ],
        [{variable: 'bass'}]
    ],
    clefs: ['treble', 'bass'],
    meter: '4/4',
    key: 'ees \\major'

} as JMusicSettings;
