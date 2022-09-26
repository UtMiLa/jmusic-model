import { NoteDirection } from '../../model';
import { NoteViewModel } from './../../logical-view/view-model/note-view-model';
import { Metrics } from './metrics';

export function staffLineToY(staffLine: number, settings: Metrics): number {
    return settings.staffLineWidth - (-1 - staffLine) * settings.staffLineWidth;
}

export function calcDisplacements(note: NoteViewModel): number[] {
    const res = [];
    if (note.direction === NoteDirection.Up) {
        let prev = -Infinity;
        let displacement = 0;
        for (let i = 0; i < note.positions.length; i++) {
            if (note.positions[i] - 1 === prev) {
                displacement = 1 - displacement;
            } else {
                displacement = 0;
            }
            res.push(displacement);
            prev = note.positions[i];
        }
        return res;
    } else {
        let prev = Infinity;
        let displacement = 0;
        for (let i = note.positions.length - 1; i >= 0; i--) {
            if (note.positions[i] + 1 === prev) {
                displacement = -1 - displacement;
            } else {
                displacement = 0;
            }
            res.push(displacement);
            prev = note.positions[i];
        }
        return res.reverse();
       
    }
    return[0, 1, 0, 1, 0, 1, 0, 1];
}