import { MultiFlexibleSequence } from './../src/model/score/multi-flexible-sequence';
import { MyCanvasRenderer, PhysicalModel, StandardMetrics, renderOnRenderer, viewModelToPhysical } from '../src/physical-view';
import { ClefType, JMusic, Time } from '../src/model';
import { scoreModelToViewModel } from '../src/logical-view';
import { RenderPosition } from '../src/physical-view/render/render-types';
import { ProjectFlex } from '../src/model/facade/project-flex';

console.log('Demo');

function myRenderOnCanvas(physicalModel: PhysicalModel, canvas: HTMLCanvasElement, position: RenderPosition) {
    renderOnRenderer(physicalModel, new MyCanvasRenderer(canvas), position);
}

const textContainer = (document.querySelector('#message') as HTMLDivElement);

export function render(jMusicTest: ProjectFlex): void {
    try {
    
        const jMusic = new JMusic(jMusicTest);

        const restrictions = { startTime: Time.StartTime, endTime: Time.EternityTime };
        const logicalModel = scoreModelToViewModel(jMusic, restrictions);

        const notesCanvas = (document.querySelector('#content') as HTMLCanvasElement);

        const phv = viewModelToPhysical(logicalModel, new StandardMetrics(), undefined);

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
    render({
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
            }
        ]
        
    });
}, 30);