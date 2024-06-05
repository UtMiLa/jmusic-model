import { SelectionManager } from './../src/selection/selection-types';
import { TextCommandEngine } from './../src/editor/text-command-engine';
import { Cursor } from './../src/physical-view/physical/cursor';
import { InsertionPoint } from './../src/editor/insertion-point';
import { MultiFlexibleSequence } from './../src/model/score/multi-flexible-sequence';
import { MyCanvasRenderer, PhysicalModel, StandardMetrics, renderOnRenderer, viewModelToPhysical } from '../src/physical-view';
import { ClefType, JMusic, JMusicSettings, NoteDirection, ScoreDef, SeqFunction, Time } from '../src/model';
import { scoreModelToViewModel } from '../src/logical-view';
import { RenderPosition } from '../src/physical-view/render/render-types';
import { ProjectFlex } from '../src/model/facade/project-flex';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { SelectionAll, SelectionVoiceTime } from '../src/selection/query';
import { option } from 'fp-ts';

//console.log('Demo');


const variablesAndFunctionsVars = {
    var1: ['c\'4. d\'8'],
    var2: ['e\'4 g\'4'],
    varOfVars: [{variable: 'var2'}, {variable: 'var1'}],
    funcOfConst: [{ function: 'Transpose', args: ['c\'4. d\'8'], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction],
    funcOfVar: [{ function: 'Transpose', args: [{variable: 'var1'}], extraArgs: [{interval: 2, alteration: -1}] } as SeqFunction]
};
  
const variablesAndFunctions = {
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

export const moonlightScoreDef = {
    content: [
        [
            [
                {
                    function: 'Arpeggio',
                    extraArgs: [
                        { 
                            'function': 'Tuplet', 
                            extraArgs: [{ numerator: 2, denominator: 3 }], 
                            args: ['c8 d8 e8'] 
                        }
                    ], 
                    args: ['<gis cis\' e\'>1 <gis dis\' fis\'>1 <gis cis\' e\'>2'] 
                }
            ]
        ],
        [
            [
                '<gis cis\' e\'>1 <gis dis\' fis\'>1 <gis cis\' e\'>2'
            ]
        ]
    ],
    clefs: ['treble', 'bass'],
    meter: '4/4',
    key: 'cis \\minor'
  
} as JMusicSettings;

const moonlightVars = {};


export const contrapunctusVars = {
    soprano:  [{
        function: 'Relative',
        args: [`r1
      a2 d,4. e8
      f4. g8 a2
      bes2 a4. g8
      f2~ f8 e8 f8 g8
      a4~ a16 g16 f16 e16 d4~ d16 d16 e16 f16
      e16 d16 c16 b16 a8 r8 r16 e'16 a16 g16 f16 e16 d16 c16
      b4 r4 r16 d16 e16 f16 g4~
      g16 g16 f16 e16 f4~ f16 g16 f16 e16 d4~
      d16 f16 e16 d16 cis4~ cis16 cis16 d16 e16 f4~`.replace(/\s+/g, ' ')],
        extraArgs: ['c\'\'\'']
    } as SeqFunction],
    bass: [{
        function: 'Relative',
        args: [`r1 r1 r1 r1 d1 a2. b4
        c2. d4
        e1
        f1
        e2. d4
        c1~
        c4 a4 bes4 c4
        d2 r2
        r16 g,16`.replace(/\s+/g, ' ')],
        extraArgs: ['c']
    } as SeqFunction],
    alto: [{
        function: 'Relative',
        args: [`r1 r1
      d4 a8. b16 c8. d16 e4
      f4 e8. d16 cis4~ cis16 a16 b16 cis16
      d16 bes16 a16 g16 f4~ f16 a16 b16 cis16 d4~
      d16 d16 c16 b16 c4~ c16 c16 b16 a16 gis4
      a4 e'8. d16 c8. b16 a4
      gis4 a8. b16 c4~ c16 d16 c16 bes16
      a4~ a16 a16 b16 cis16 d4~ d16 c16 bes16 a16`.replace(/\s+/g, ' ')],
        extraArgs: ['c\'\'']
    } as SeqFunction],
    tenor: [{
        function: 'Relative',
        args: [`d4 a'8. g16 f8. e16 d4
        cis4 d8. e16 f4~ f16 g16 f16 e16
        d16 cis16 d8~ d16 d16 c16 b16 a16 gis16 a8~ a16 a16 b16 cis16
        \\clef bass d16 c16 bes16 a16 g16 fis16 g8~ g16 bes16 a16 g16 f8. e16
        d4~ d16 a'16 b16 cis16 d4~ d16 a16 g16 f16
        e4 a8. g16 f8. e16 d4
        c16 d16 e8~ e16 e16 fis16 gis16 a4 r4
        r16 b16 e16 d16 c16 b16 a16 gis16 a8 r8 r4
        a4 d,8. e16 f8. g16 a4
        bes4 a8. g16 f4~ f16 e16 f16 g16`.replace(/\s+/g, ' ')],
        extraArgs: ['c\'']
    } as SeqFunction]
};
  
export const contrapunctus = {
    content: [
        [
            [
                {variable: 'soprano'}
            ],
  
            [
                {variable: 'alto'}
            ]
        ],
        [
            [`d4 a'8. g16 f8. e16 d4
            cis4 d8. e16 f4~ f16 g16 f16 e16
            d16 cis16 d8~ d16 d16 c16 b16 a16 gis16 a8~ a16 a16 b16 cis16
            \\clef bass d16 c16 bes16 a16 g16 fis16 g8~ g16 bes16 a16 g16 f8. e16
            d4~ d16 a'16 b16 cis16 d4~ d16 a16 g16 f16
            e4 a8. g16 f8. e16 d4
            c16 d16 e8~ e16 e16 fis16 gis16 a4 r4
            r16 b16 e16 d16 c16 b16 a16 gis16 a8 r8 r4
            a4 d,8. e16 f8. g16 a4
            bes4 a8. g16 f4~ f16 e16 f16 g16`.replace(/\s+/g, ' ')],
            [{variable: 'bass'}]
        ]
    ],
    clefs: ['treble', 'treble'],
    meter: '4/4',
    key: 'd \\minor'
  
} as JMusicSettings;
  


function myRenderOnCanvas(physicalModel: PhysicalModel, canvas: HTMLCanvasElement, position: RenderPosition) {
    renderOnRenderer(physicalModel, new MyCanvasRenderer(canvas), position);
}
const input = (document.querySelector('#commandInput') as HTMLInputElement);
const term = new Terminal();
term.open(document.getElementById('terminal') as HTMLDivElement);
term.write('$ ');

let command = '';

function prompt(term: Terminal) {
    command = '';
    term.write('\r\n$ ');
}

term.onData(e => {
    switch (e) {
        case '\u0003': // Ctrl+C
            term.write('^C');
            prompt(term);
            break;
        case '\r': // Enter
            try {
                const cmd = TextCommandEngine.parse(command);
                cmd.execute(jMusic, insertionPoint, selMan);
                command = '';
                render();
            } catch (e) {
                term.writeln('\r\nIllegal command');
            }
            prompt(term);
            break;
        case '\u007F': // Backspace (DEL)
            // Do not delete the prompt
            if ((term as any)._core.buffer.x > 2) {
                term.write('\b \b');
                if (command.length > 0) {
                    command = command.substr(0, command.length - 1);
                }
            }
            break;
        default: // Print all other characters for demo
            if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                command += e;
                term.write(e);
            }
    }
});



const musicDef: ScoreDef = {
    staves: [
        {
            initialClef: { clefType: ClefType.G, line: -2 },
            initialKey: { accidental: 0, count: 0 },
            initialMeter: { count: 4, value: 4 },
            voices: [
                {
                    //contentDef: ['g\'4 s4 a\'2', 'c\'4 d\'4 e\'4 g\'4']
                    contentDef: [
                        'b\'4 r4 c\'\'2',
                        { type: 'multi', sequences: ['g\'4 s4 a\'2', 'c\'4 d\'4 e\'4 g\'4'] },
                        'g\'4 r4 a\'2'
                    ]
                },
                
                {
                    //contentDef: ['g\'4 s4 a\'2', 'c\'4 d\'4 e\'4 g\'4']
                    contentDef: [
                        'g\'2 ees\'2'
                    ]
                }
            ]
        },
        {
            initialClef: { clefType: ClefType.F, line: 2 },
            initialKey: { accidental: 0, count: 0 },
            initialMeter: { count: 4, value: 4 },
            voices: [
                {
                    contentDef: ['g4 r4 a2', 'c4 d4~ d4 g4'],
                    noteDirection: NoteDirection.Up
                },
                
                {
                    contentDef: [
                        'g,2 ees,2 g,2 ees,2 g,2 ees,2'
                    ],
                    noteDirection: NoteDirection.Down
                }
            ]

        }
    ]
    
};

const jMusic = new JMusic(moonlightScoreDef, moonlightVars);
const insertionPoint = new InsertionPoint(jMusic);

input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') {
        console.log(ev, input.value);
        const cmd = TextCommandEngine.parse(input.value);
        cmd.execute(jMusic, insertionPoint, selMan);
        input.value = '';
        //insertionPoint.moveToTime(Time.fromStart(Time.WholeTime));
        //jMusic.addKeyChg(insertionPoint, { accidental: 1, count: 2 });
        render();
    }
});

const selMan = new SelectionManager();
const select = new SelectionVoiceTime(jMusic, 1, 0, Time.newAbsolute(7, 32), Time.newAbsolute(11, 8));
selMan.setSelection(select);

const textContainer = (document.querySelector('#message') as HTMLDivElement);

export function render(): void {
    try {

        const restrictions = { startTime: Time.StartTime, endTime: Time.EternityTime };
        const logicalModel = scoreModelToViewModel(
            jMusic, 
            //option.some(new SelectionVoiceTime(jMusic.model, 1, 0, Time.StartTime, Time.newAbsolute(1, 2))), 
            //option.some(new SelectionVoiceTime(jMusic.model, 1, 0, Time.newAbsolute(1, 2), Time.EternityTime)), 
            selMan.get(),
            restrictions);

        //console.log('Sel', select.isSelected({ elementNo: 2, staffNo: 1, voiceNo: 0 }));

        const cursor = {
            absTime: insertionPoint?.time,
            staff: insertionPoint?.staffNo,
            position: insertionPoint?.position
        } as Cursor;

        const notesCanvas = (document.querySelector('#content') as HTMLCanvasElement);

        const phv = viewModelToPhysical(logicalModel, new StandardMetrics(), cursor);

        myRenderOnCanvas(phv, notesCanvas, {
            offsetX: 10,
            offsetY: 40,
            scaleX: 1.2,
            scaleY: 1.2
        });
        

        setTimeout(() => {
            myRenderOnCanvas(phv, notesCanvas, {
                offsetX: 10,
                offsetY: 40,
                scaleX: 1.2,
                scaleY: 1.2
            });
        }, 1000);
        //textContainer.textContent = JSON.stringify(phv);
    } catch (e) {
        //textContainer.textContent = e;
        console.log(e);
    }

}


setTimeout(() => {
    //render({ content: [[{ type: 'multi', sequences: ['g\'4 s4 a\'2', 'c\'4 d\'4 e\'4 g\'4'] }]]});
    render();
}, 30);