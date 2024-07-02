import { JMusicSettings, SeqFunction } from '../../src/model';

export const variablesAndFunctionsVars = {
    var1: ['c\'4. d\'8'],
    var2: ['e\'4 g\'4'],
    varOfVars: [{variable: 'var2'}, {variable: 'var1'}],
    funcOfConst: [{ function: 'Transpose', args: ['c\'4. d\'8'], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction],
    funcOfVar: [{ function: 'Transpose', args: [{variable: 'var1'}], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction]
};

export const variablesAndFunctions = {
    content: [
        [
            [
                {variable: 'var1'},
                {variable: 'var2'},
                {variable: 'varOfVars'},
                {variable: 'funcOfConst'},
                {variable: 'funcOfVar'}
            ]
        ]
    ],
    clefs: ['treble'],
    meter: '4/4',
    key: 'c \\major'

} as JMusicSettings;
