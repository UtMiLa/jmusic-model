import { SVGRenderer } from './../src/physical-view/render/svg-renderer';
import { SelectionManager } from './../src/selection/selection-types';
import { TextCommandEngine } from './../src/editor/text-command-engine';
import { Cursor } from './../src/physical-view/physical/cursor';
import { InsertionPoint } from './../src/editor/insertion-point';
import { meterModel } from './demodata/time-changes';
import { MultiFlexibleSequence } from './../src/model/score/multi-flexible-sequence';
import { MyCanvasRenderer, PhysicalModel, StandardMetrics, generateMeasureMap, renderOnCanvas, renderOnRenderer, viewModelToPhysical } from '../src/physical-view';
import { AbsoluteTime, ClefType, JMusic, JMusicSettings, NoteDirection, ScoreDef, SeqFunction, Time, VarDictFlex, ProjectDef } from '../src/model';
import { SubsetDef, scoreModelToViewModel } from '../src/logical-view';
import { RenderPosition } from '../src/physical-view/render/render-types';
import { ProjectFlex } from '../src/model/facade/project-flex';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { SelectionAll, SelectionVoiceTime } from '../src/selection/query';
import { option, string } from 'fp-ts';
import { none } from 'fp-ts/lib/Option';
import { tupletVars, tuplets } from './demodata/tuplets';
import { longDeco } from './demodata/longdeco';
import { lyrics } from './demodata/lyrics';
import { contrapunctus, contrapunctusVars } from './contrapunctus';
import { accidentalTest } from './demodata/accidentalDisplacement';
import { beamModel } from './demodata/beaming';
import { expressions } from './demodata/expressions';
import { grace } from './demodata/grace';
import { koral41 } from './demodata/koral41';
import { repeats } from './demodata/repeats';
import { stateChanges } from './demodata/state-changes';
import { variablesAndFunctions, variablesAndFunctionsVars } from './demodata/variables-and-functions';
import { moonlightScoreDef, moonlightVars } from './moonlight';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const Emmentaler = require('./fonts/Emmentaler-20.woff');

//console.log('Demo', Emmentaler);

const demos: [string, JMusicSettings | ScoreDef | ProjectDef, VarDictFlex?][] = [
    ['Accidentals', accidentalTest],
    ['Beaming model', beamModel],
    ['Contrapunctus', contrapunctus, contrapunctusVars],
    ['Expressions', expressions],
    ['Grace notes', grace],
    ['Hymn', koral41],
    ['Long decorations', longDeco],
    ['Lyrics', lyrics],
    ['Moonlight', moonlightScoreDef, moonlightVars],
    ['Repeats', repeats],
    ['State changes', stateChanges],
    ['Time model', meterModel],
    ['Tuplets', tuplets, tupletVars],
    ['Variables', variablesAndFunctions, variablesAndFunctionsVars]
];

const scale = 1.2;

let myRender = (physicalModel: PhysicalModel, position: RenderPosition) => {
    //
};

const input = (document.querySelector('#commandInput') as HTMLInputElement);
const term = new Terminal();
term.open(document.getElementById('terminal') as HTMLDivElement);
term.write('$ ');


function prompt(term: Terminal) {
    command = '';
    term.write('\r\n$ ');
}

const termCommandStack: string[] = [];
let termCommandStackPointer = -1;
let command = '';
let commandPointer = 0;

const W_UP = '\x1b[A';
const W_DOWN = '\x1b[B';
const W_RIGHT = '\x1b[C';
const W_LEFT = '\x1b[D';
const W_END = '\x1b[F';
const W_HOME = '\x1b[H';

term.onData(e => {
    switch (e) {
        case '\u0003': // Ctrl+C
            term.write('^C');
            prompt(term);
            break;
        case '\r': // Enter
            try {
                termCommandStack.push(command);
                termCommandStackPointer = termCommandStack.length;
                const cmd = TextCommandEngine.parse(command);
                const answer = cmd.execute(jMusic, insertionPoint, selMan);
                if (typeof answer === 'string') {
                    //console.log('answer', JSON.stringify(answer));
                    term.writeln(answer.replace(/\n/g, '\n\r'));
                }
                command = '';
                commandPointer = 0;
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
                    command = command.substring(0, command.length - 1);
                    commandPointer--;
                }
            }
            break;
        case W_UP: 
            if (termCommandStack.length) {
                termCommandStackPointer--;
                if (termCommandStackPointer < 0) termCommandStackPointer = termCommandStack.length - 1;
                command = termCommandStack[termCommandStackPointer];
                commandPointer = command.length;
                term.write('\x1b[2K\r$ ' + command);
            }
            break;
        case W_DOWN: 
            if (termCommandStack.length) {
                termCommandStackPointer++;
                if (termCommandStackPointer >= termCommandStack.length) termCommandStackPointer = 0;
                command = termCommandStack[termCommandStackPointer];
                commandPointer = command.length;
                term.write('\x1b[2K\r$ ' + command);
            }
            break;
        case W_LEFT: 
            term.write('\b');
            if (commandPointer > 0)
                commandPointer--;
            break;
        case W_RIGHT: 
            //console.log(commandPointer, command);
            if (commandPointer < command.length)
                commandPointer++;
            term.write(e);
            break;
        default: // Print all other characters for demo
            if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                command = command.substring(0, commandPointer) + e + command.substring(commandPointer);
                commandPointer++;
                //term.write(e);
                term.write('\r$ ' + command + '\r\x1b[' + (commandPointer + 2) + 'C');
            } else {
                console.log(e.split('').map(c => c.charCodeAt(0)));
            }

    }
});



input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') {
        console.log(ev, input.value);
        const cmd = TextCommandEngine.parse(input.value);
        const answer = cmd.execute(jMusic, insertionPoint, selMan);
        if (typeof answer === 'string') {
            term.writeln(answer.replace(/\n/g, '\n\r'));
        }

        input.value = '';
        //insertionPoint.moveToTime(Time.fromStart(Time.WholeTime));
        //jMusic.addKeyChg(insertionPoint, { accidental: 1, count: 2 });
        render();
    }
});

const textContainer = (document.querySelector('#message') as HTMLDivElement);

let jMusic = new JMusic(lyrics, {});
let insertionPoint = new InsertionPoint(jMusic);

let selMan = new SelectionManager();
const select = new SelectionVoiceTime(jMusic, 1, 0, Time.newAbsolute(7, 32), Time.newAbsolute(11, 8));
selMan.setSelection(select);

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

        const phv = viewModelToPhysical(logicalModel, new StandardMetrics(), cursor);

        console.log('model', jMusic, jMusic.staves, logicalModel, phv);

        myRender(phv, {
            offsetX: 10,
            offsetY: 40,
            scaleX: scale,
            scaleY: scale
        });

        console.log('render');

    } catch (e) {
        //textContainer.textContent = e;
        console.log(e);
    }

}



const restrictions: SubsetDef = { startTime: Time.StartTime, endTime: Time.EternityTime };

const splits: AbsoluteTime[] = [Time.StartTime];
const settings = new StandardMetrics({
    staffLineWidth: 6
});

function clickElement(i: number, $event: MouseEvent) {
    //console.log('log mm', $event);
    if (i >= splits.length) return;

    if (!jMusic) return;
    const restrictions1 = { startTime: splits[i], endTime: i === splits.length - 1 ? restrictions.endTime : splits[i+1] };
    const restrictedLogicalModel = scoreModelToViewModel(jMusic, none, restrictions1);

    const map = generateMeasureMap(restrictedLogicalModel, settings);
    //console.log(map);
    //console.log('log map', map);
    const localized = map.localize(($event.clientX) / scale, ($event.clientY*2 - 12) / scale, settings);
    if (!localized) {
        //this.mouseDebug = '';
        return;
    }

    //this.mouseDebug = JSON.stringify($event.clientX) + ',' + JSON.stringify($event.clientY) + ' ' + JSON.stringify(localized);
    //console.log('log loc', this.mouseDebug);
    //_insertionPoint = new InsertionPoint(this.scoreDef);
    if (!insertionPoint) return;


    if (Time.sortComparison(insertionPoint.time, localized.time) !==0 || insertionPoint.position !== 15-localized.pitch) {
        insertionPoint.time = localized.time;
        insertionPoint.staffNo = localized.staff;
        insertionPoint.position = 15-localized.pitch;
        console.log(insertionPoint, $event);

        render();
    }
}

// Setup


const notesCanvas = (document.querySelector('#content') as HTMLCanvasElement);
notesCanvas.addEventListener('click', (event: MouseEvent) => {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();

    const data = {
        ...event,
        clientX: event.clientX - rect.left, 
        clientY: event.clientY - rect.top
        /*startTime: restrictions.startTime,
        model: jMusic*/
    };

    clickElement(0, data);
});

const notesSvg = (document.querySelector('#content-svg') as SVGElement);
notesSvg.addEventListener('click', (event: MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();

    const data = {
        ...event,
        clientX: event.clientX - rect.left, 
        clientY: event.clientY - rect.top
        /*startTime: restrictions.startTime,
        model: jMusic*/
    };

    clickElement(0, data);
});

const selectOutputElement = document.getElementById('SelectOutputElement') as HTMLSelectElement;
const useCurves = document.getElementById('UseCurves') as HTMLInputElement;
const selectDemos = document.getElementById('SelectDemos') as HTMLSelectElement;

selectOutputElement.addEventListener('change', (event) => {
    render();
});
useCurves.addEventListener('change', (event) => {
    render();
});

demos.forEach((demo, idx) => {
    const elm = document.createElement('option');
    elm.setAttribute('value', idx + '');
    elm.textContent = demo[0];
    selectDemos.appendChild(elm);
});
selectDemos.addEventListener('change', (event) => {
    const idx = +selectDemos.value;
    //alert(demos[idx][1]);    

    jMusic = new JMusic(demos[idx][1], demos[idx][2] ?? {});    
    insertionPoint = new InsertionPoint(jMusic);
    selMan = new SelectionManager();
    render();
});

myRender = (physicalModel: PhysicalModel, position: RenderPosition) => {
    if (selectOutputElement.value === 'SVG') {
        renderOnRenderer(physicalModel, new SVGRenderer(notesSvg), position);
        notesSvg.style.display = 'block';
        notesCanvas.style.display = 'none';
    } else {
        if (useCurves.checked) {
            console.log('MyCanvas');
            renderOnRenderer(physicalModel, new MyCanvasRenderer(notesCanvas), position);      
        } else {
            console.log('Std Canvas');
            renderOnCanvas(physicalModel, notesCanvas, position);
        }
        notesSvg.style.display = 'none';
        notesCanvas.style.display = 'block';
    }
};


setTimeout(() => {
    //render({ content: [[{ type: 'multi', sequences: ['g\'4 s4 a\'2', 'c\'4 d\'4 e\'4 g\'4'] }]]});
    render();
}, 30);

