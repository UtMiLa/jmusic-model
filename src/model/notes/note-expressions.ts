import { NoteDirection } from './note';
export function parseLilyNoteExpression(input: string): NoteExpression {
    const res = noteExpressions.find(elem => elem.lily === input || elem.shortLily === input);
    if (!res) throw 'Unknown Lilypond expression: ' + input;
    return res.name;
}

export function getGlyphForNoteExpression(input: NoteExpression, directionUp: boolean): string {
    const res = noteExpressions.find(elem => elem.name === input);
    if (!res) throw 'Unknown note expression: ' + input;
    if (res.upDown) {
        return 'scripts.' + (directionUp ? 'd' : 'u') + res.glyphBase;
    }
    return 'scripts.' + res.glyphBase;
}


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
    glyphBase: string;
    upDown?: boolean;
    lily?: string;
    shortLily?: string;
}

export const noteExpressions: NoteExpressionInfo[] = [
    {
        'name': 'fermata',
        'glyphBase': 'fermata',
        'upDown': true,
        'lily': '\\fermata'
    },
    {
        'name': 'shortfermata',
        'glyphBase': 'shortfermata',
        'upDown': true,
        'lily': '\\shortfermata'
    },
    {
        'name': 'longfermata',
        'glyphBase': 'longfermata',
        'upDown': true,
        'lily': '\\longfermata'
    },
    {
        'name': 'verylongfermata',
        'glyphBase': 'verylongfermata',
        'upDown': true,
        'lily': '\\verylongfermata'
    },
    {
        'name': 'veryshortfermata',
        'glyphBase': 'veryshortfermata',
        'upDown': true,
        'lily': '\\veryshortfermata'
    },
    {
        'name': 'henzeshortfermata',
        'glyphBase': 'henzeshortfermata',
        'upDown': true,
        'lily': '\\henzeshortfermata'
    },
    {
        'name': 'henzelongfermata',
        'glyphBase': 'henzelongfermata',
        'upDown': true,
        'lily': '\\henzelongfermata'
    },
    {
        'name': 'thumb',
        'glyphBase': 'thumb',
        'lily': '\\thumb'
    },
    {
        'name': 'sforzato',
        'glyphBase': 'sforzato',
        'lily': '\\accent',
        'shortLily': '->'
    },
    {
        'name': 'espr',
        'glyphBase': 'espr',
        'lily': '\\espressivo'
    },
    {
        'name': 'staccato',
        'glyphBase': 'staccato',
        'lily': '\\staccato',
        'shortLily': '-.'
    },
    {
        'name': 'staccatissimo',
        'glyphBase': 'staccatissimo',
        'upDown': true,
        'lily': '\\staccatissimo',
        'shortLily': '-!'
    },
    {
        'name': 'tenuto',
        'glyphBase': 'tenuto',
        'lily': '\\tenuto',
        'shortLily': '--'
    },
    {
        'name': 'portato',
        'glyphBase': 'portato',
        'upDown': true,
        'lily': '\\portato',
        'shortLily': '-_'
    },
    {
        'name': 'marcato',
        'glyphBase': 'marcato',
        'upDown': true,
        'lily': '\\marcato',
        'shortLily': '-^'
    },
    {
        'name': 'open',
        'glyphBase': 'open',
        'lily': '\\open'
    },
    {
        'name': 'halfopen',
        'glyphBase': 'halfopen',
        'lily': '\\halfopen'
    },
    {
        'name': 'halfopenvertical',
        'glyphBase': 'halfopenvertical'
    },
    {
        'name': 'stopped',
        'glyphBase': 'stopped',
        'lily': '\\stopped',
        'shortLily': '-+'
    },
    {
        'name': 'upbow',
        'glyphBase': 'upbow',
        'lily': '\\upbow'
    },
    {
        'name': 'downbow',
        'glyphBase': 'downbow',
        'lily': '\\downbow'
    },
    {
        'name': 'reverseturn',
        'glyphBase': 'reverseturn',
        'lily': '\\reverseturn'
    },
    {
        'name': 'turn',
        'glyphBase': 'turn',
        'lily': '\\turn'
    },
    {
        'name': 'slashturn',
        'glyphBase': 'slashturn',
        'lily': '\\slashturn'
    },
    {
        'name': 'haydnturn',
        'glyphBase': 'haydnturn',
        'lily': '\\haydnturn'
    },
    {
        'name': 'trill',
        'glyphBase': 'trill',
        'lily': '\\trill'
    },
    {
        'name': 'upedalheel',
        'glyphBase': 'upedalheel',
        'lily': '\\lheel'
    },
    {
        'name': 'dpedalheel',
        'glyphBase': 'dpedalheel',
        'lily': '\\rheel'
    },
    {
        'name': 'upedaltoe',
        'glyphBase': 'upedaltoe',
        'lily': '\\ltoe'
    },
    {
        'name': 'dpedaltoe',
        'glyphBase': 'dpedaltoe',
        'lily': '\\rtoe'
    },
    {
        'name': 'flageolet',
        'glyphBase': 'flageolet',
        'lily': '\\flageolet'
    },
    {
        'name': 'segno',
        'glyphBase': 'segno',
        'lily': '\\segno'
    },
    {
        'name': 'varsegno',
        'glyphBase': 'varsegno'
    },
    {
        'name': 'coda',
        'glyphBase': 'coda',
        'lily': '\\coda'
    },
    {
        'name': 'varcoda',
        'glyphBase': 'varcoda',
        'lily': '\\varcoda'
    },
    {
        'name': 'rcomma',
        'glyphBase': 'rcomma'
    },
    {
        'name': 'lcomma',
        'glyphBase': 'lcomma'
    },
    {
        'name': 'rvarcomma',
        'glyphBase': 'rvarcomma'
    },
    {
        'name': 'lvarcomma',
        'glyphBase': 'lvarcomma'
    },
    {
        'name': 'arpeggio',
        'glyphBase': 'arpeggio'
    },
    {
        'name': 'trill_element',
        'glyphBase': 'trill_element'
    },
    {
        'name': 'arpeggio.arrow.M1',
        'glyphBase': 'arpeggio.arrow.M1'
    },
    {
        'name': 'arpeggio.arrow.1',
        'glyphBase': 'arpeggio.arrow.1'
    },
    {
        'name': 'trilelement',
        'glyphBase': 'trilelement'
    },
    {
        'name': 'prall',
        'glyphBase': 'prall',
        'lily': '\\prall'
    },
    {
        'name': 'mordent',
        'glyphBase': 'mordent',
        'lily': '\\mordent'
    },
    {
        'name': 'prallprall',
        'glyphBase': 'prallprall',
        'lily': '\\prallprall'
    },
    {
        'name': 'prallmordent',
        'glyphBase': 'prallmordent',
        'lily': '\\prallmordent'
    },
    {
        'name': 'upprall',
        'glyphBase': 'upprall',
        'lily': '\\upprall'
    },
    {
        'name': 'upmordent',
        'glyphBase': 'upmordent',
        'lily': '\\upmordent'
    },
    {
        'name': 'pralldown',
        'glyphBase': 'pralldown',
        'lily': '\\pralldown'
    },
    {
        'name': 'downprall',
        'glyphBase': 'downprall',
        'lily': '\\downprall'
    },
    {
        'name': 'downmordent',
        'glyphBase': 'downmordent',
        'lily': '\\downmordent'
    },
    {
        'name': 'prallup',
        'glyphBase': 'prallup',
        'lily': '\\prallup'
    },
    {
        'name': 'lineprall',
        'glyphBase': 'lineprall',
        'lily': '\\lineprall'
    },
    {
        'name': 'caesura.curved',
        'glyphBase': 'caesura.curved'
    },
    {
        'name': 'caesura.straight',
        'glyphBase': 'caesura.straight'
    },
    {
        'name': 'tickmark',
        'glyphBase': 'tickmark'
    },
    {
        'name': 'snappizzicato',
        'glyphBase': 'snappizzicato',
        'lily': '\\snappizzicato'
    }
];