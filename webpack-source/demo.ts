import { MyCanvasRenderer, PhysicalModel, StandardMetrics, renderOnRenderer, viewModelToPhysical } from '../src/physical-view';
import { JMusic, Time } from '../src/model';
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
    render({ content: [['g\'4 s4 a\'2', 'c\'4 d\'4 e\'4 g\'4']]});
}, 30);