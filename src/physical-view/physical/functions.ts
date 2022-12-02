import { NoteDirection } from '../../model';
import { NoteViewModel } from './../../logical-view';
import { Metrics } from './metrics';
import * as eql from 'deep-eql';

export function scaleDegreeToY(scaleDegree: number, settings: Metrics): number {
    return settings.scaleDegreeUnit*2 - (-2 - scaleDegree) * settings.scaleDegreeUnit;
}

export function yToScaleDegree(y: number, settings: Metrics): number {
    return (y - settings.scaleDegreeUnit*2) / (settings.scaleDegreeUnit) - 2;
}

export function staffLineToY(staffLine: number, settings: Metrics): number {
    return settings.scaleDegreeUnit*2 - (-1 - staffLine) * settings.scaleDegreeUnit*2;
}

export function yToStaffLine(y: number, settings: Metrics): number {
    return (y  - settings.scaleDegreeUnit*2) / (settings.scaleDegreeUnit*2) - 1;
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

export function deepEquals<T>(a: T, b: T): boolean {
    return eql(a, b);
}