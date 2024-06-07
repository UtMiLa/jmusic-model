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
            initialMeter: { meters: [{ count: 3, value: 8}, { count: 5, value: 8}], commonDenominator: true },
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

const jMusic = new JMusic(musicDef, {});
//const jMusic = new JMusic(moonlightScoreDef, moonlightVars);
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