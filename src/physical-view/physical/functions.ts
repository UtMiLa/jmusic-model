import { NoteDirection } from '../../model';
import { NoteViewModel } from './../../logical-view';
import { Metrics } from './metrics';

export function staffLineToY(staffLine: number, settings: Metrics): number {
    return settings.staffLineWidth - (-1 - staffLine) * settings.staffLineWidth;
}

export function calcDisplacements(note: NoteViewModel): number[] {
    let prev: number;
    let delta: number;
    let positions: number[];

    if (note.direction === NoteDirection.Up) {
        prev = -Infinity;
        delta = -1;
        positions = note.positions;
    } else {
        prev = Infinity;
        delta = 1;
        positions = note.positions.reverse();
    }

    let displacement = 0;

    const res = positions.map(pos => {    
        if (pos + delta === prev) {
            displacement = -delta - displacement;
        } else {
            displacement = 0;
        }
        prev = pos;
        return displacement;
    });

    return delta === 1 ? res.reverse() : res;
}