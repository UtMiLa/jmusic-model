export type NoteExpression = 
    'fermata' |
    'shortfermata' |
    'longfermata' |
    'verylongfermata' |
    'veryshortfermata' |
    'henzeshortfermata' |
    'henzelongfermata' |
    'thumb' |
    'sforzato' |
    'espr' |
    'staccato' |
    'staccatissimo' |
    'tenuto' |
    'portato' |
    'marcato' |
    'open' |
    'halfopen' |
    'halfopenvertical' |
    'stopped' |
    'upbow' |
    'downbow' |
    'reverseturn' |
    'turn' |
    'slashturn' |
    'haydnturn' |
    'trill' |
    'upedalheel' |
    'dpedalheel' |
    'upedaltoe' |
    'dpedaltoe' |
    'flageolet' |
    'segno' |
    'varsegno' |
    'coda' |
    'varcoda' |
    'rcomma' |
    'lcomma' |
    'rvarcomma' |
    'lvarcomma' |
    'arpeggio' |
    'trill_element' |
    'arpeggio.arrow.M1' |
    'arpeggio.arrow.1' |
    'trilelement' |
    'prall' |
    'mordent' |
    'prallprall' |
    'prallmordent' |
    'upprall' |
    'upmordent' |
    'pralldown' |
    'downprall' |
    'downmordent' |
    'prallup' |
    'lineprall' |
    'caesura.curved' |
    'caesura.straight' |
    'tickmark' |
    'snappizzicato';


export interface NoteExpressionInfo {
    name: NoteExpression;
    upDown?: boolean;
    lily?: string;
    shortLily?: string;
}

export const noteExpressions: NoteExpressionInfo[] = [
    {
        'name': 'fermata',
        'upDown': true,
        'lily': '\\fermata'      
    },
    {
        'name': 'shortfermata',
        'upDown': true,
        'lily': '\\shortfermata'      
    },
    {
        'name': 'longfermata',
        'upDown': true,
        'lily': '\\longfermata'      
    },
    {
        'name': 'verylongfermata',
        'upDown': true,
        'lily': '\\verylongfermata'      
    },
    {
        'name': 'veryshortfermata',
        'upDown': true,
        'lily': '\\veryshortfermata'      
    },
    {
        'name': 'henzeshortfermata',
        'upDown': true,
        'lily': '\\henzeshortfermata'      
    },
    {
        'name': 'henzelongfermata',
        'upDown': true,
        'lily': '\\henzelongfermata'      
    },
    {
        'name': 'thumb',
        'lily': '\\thumb'      
    },
    {
        'name': 'sforzato',
        'lily': '\\accent',
        'shortLily': '->'
    },
    {
        'name': 'espr',
        'lily': '\\espressivo'      
    },
    {
        'name': 'staccato',
        'lily': '\\staccato',
        'shortLily': '-.'
    },
    {
        'name': 'staccatissimo',
        'upDown': true,
        'lily': '\\staccatissimo',
        'shortLily': '-!'
    },
    {
        'name': 'tenuto',
        'lily': '\\tenuto',
        'shortLily': '--'
    },
    {
        'name': 'portato',
        'upDown': true,
        'lily': '\\portato',
        'shortLily': '-_'
    },
    {
        'name': 'marcato',
        'upDown': true,
        'lily': '\\marcato',
        'shortLily': '-^'
    },
    {
        'name': 'open',
        'lily': '\\open'      
    },
    {
        'name': 'halfopen',
        'lily': '\\halfopen'      
    },
    {
        'name': 'halfopenvertical'              
    },
    {
        'name': 'stopped',
        'lily': '\\stopped',
        'shortLily': '-+'
    },
    {
        'name': 'upbow',
        'lily': '\\upbow'      
    },
    {
        'name': 'downbow',
        'lily': '\\downbow'      
    },
    {
        'name': 'reverseturn',
        'lily': '\\reverseturn'      
    },
    {
        'name': 'turn',
        'lily': '\\turn'      
    },
    {
        'name': 'slashturn',
        'lily': '\\slashturn'      
    },
    {
        'name': 'haydnturn',
        'lily': '\\haydnturn'      
    },
    {
        'name': 'trill',
        'lily': '\\trill'      
    },
    {
        'name': 'upedalheel',
        'lily': '\\lheel'      
    },
    {
        'name': 'dpedalheel',
        'lily': '\\rheel'      
    },
    {
        'name': 'upedaltoe',
        'lily': '\\ltoe'      
    },
    {
        'name': 'dpedaltoe',
        'lily': '\\rtoe'      
    },
    {
        'name': 'flageolet',
        'lily': '\\flageolet'      
    },
    {
        'name': 'segno',
        'lily': '\\segno'      
    },
    {
        'name': 'varsegno'              
    },
    {
        'name': 'coda',
        'lily': '\\coda'      
    },
    {
        'name': 'varcoda',
        'lily': '\\varcoda'      
    },
    {
        'name': 'rcomma'              
    },
    {
        'name': 'lcomma'              
    },
    {
        'name': 'rvarcomma'              
    },
    {
        'name': 'lvarcomma'              
    },
    {
        'name': 'arpeggio'              
    },
    {
        'name': 'trill_element'              
    },
    {
        'name': 'arpeggio.arrow.M1'              
    },
    {
        'name': 'arpeggio.arrow.1'              
    },
    {
        'name': 'trilelement'              
    },
    {
        'name': 'prall',
        'lily': '\\prall'      
    },
    {
        'name': 'mordent',
        'lily': '\\mordent'      
    },
    {
        'name': 'prallprall',
        'lily': '\\prallprall'      
    },
    {
        'name': 'prallmordent',
        'lily': '\\prallmordent'      
    },
    {
        'name': 'upprall',
        'lily': '\\upprall'      
    },
    {
        'name': 'upmordent',
        'lily': '\\upmordent'      
    },
    {
        'name': 'pralldown',
        'lily': '\\pralldown'      
    },
    {
        'name': 'downprall',
        'lily': '\\downprall'      
    },
    {
        'name': 'downmordent',
        'lily': '\\downmordent'      
    },
    {
        'name': 'prallup',
        'lily': '\\prallup'      
    },
    {
        'name': 'lineprall',
        'lily': '\\lineprall'      
    },
    {
        'name': 'caesura.curved'              
    },
    {
        'name': 'caesura.straight'              
    },
    {
        'name': 'tickmark'              
    },
    {
        'name': 'snappizzicato',
        'lily': '\\snappizzicato'      
    }
];