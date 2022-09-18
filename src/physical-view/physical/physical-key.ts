import { PhysicalElementBase } from './physical-elements';
import { Metrics } from './metrics';
import { KeyViewModel } from './../../logical-view/view-model/convert-key';
import { staffLineToY } from './functions';

export function testKey(viewModel: any): KeyViewModel | undefined {
    return viewModel.keyPositions ? viewModel as KeyViewModel : undefined;
}

export function convertKey(key: KeyViewModel, xPos: number, settings: Metrics): PhysicalElementBase[] {
    return key.keyPositions.map((pos, i) => {
        return {
            glyph: pos.alternation === 1 ? 'accidentals.2' : 'accidentals.M2',
            position: {x: xPos + i * settings.keySigSpacing, y: staffLineToY(pos.position / 2, settings)}
        };
    });
}