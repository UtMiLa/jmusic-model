import R = require('ramda');
import { AbsoluteTime } from '../rationals/time';
import { ScoreDef } from '../score/score';
import { StaffDef } from '../score/staff';
import { VariableDef } from '../score/variables';
import { FlexibleSequence } from '../score/flexible-sequence';

export interface ProjectDef {
    score: ScoreDef;
    vars: {[key: string]: FlexibleSequence };
}

export type LensVoiceDef = [number, number] | string; // [staffNo, voiceNo] or variable name

export interface LensSettings {
    startTime: AbsoluteTime;
    voices: LensVoiceDef[][];
}

export class Lens {
    constructor(private settings: LensSettings) {}

    getPaths(): (number | string)[][][] {
        // from [[[2, 1]]] to [[['staves', 2, 'voices', 1, 'content']]] for use in Ramda path
        return this.settings.voices.map((staffPath) => 
            staffPath.map(voicePath => 
                typeof voicePath === 'string' 
                    ? ['vars', voicePath]
                    :['score', 'staves', voicePath[0], 'voices', voicePath[1]]));
    }
}

export function view(lens: Lens, project: ProjectDef): StaffDef[] {
    return lens.getPaths().map(
        staffPath => (
            { 
                voices: staffPath.map(
                    voicePath => R.path(voicePath, project)
                ),
                initialClef: R.prop('initialClef', R.path(R.take(3, staffPath[0]), project)),
                initialKey: R.prop('initialKey', R.path(R.take(3, staffPath[0]), project)),
                initialMeter: R.prop('initialMeter', R.path(R.take(3, staffPath[0]), project))
            } as unknown as StaffDef
        )
    );
}