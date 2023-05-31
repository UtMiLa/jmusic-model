import R = require('ramda');
import { AbsoluteTime, Time } from '../rationals/time';
import { ScoreDef } from '../score/score';
import { StaffDef } from '../score/staff';
import { VariableDef } from '../score/variables';
import { FlexibleSequence } from '../score/flexible-sequence';
import { ISequence, MusicEvent, isNote } from '../score/sequence';

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

export type NoteLens = R.Lens<ISequence, MusicEvent | undefined>;

export function noteLens(time: AbsoluteTime): NoteLens {
    return R.lens(

        (seq: ISequence) => R.view(seq.getElementLens(time), seq), 

        (event: MusicEvent | undefined, seq) => R.set(seq.getElementLens(time), event, seq)
        
    );
}
/*

    wanted behaviour:
        return a path to the indicated object
            ['vars', 'myVar', 5]
            ['score', 'staves', 1, 'voices', 1, 5]
        also a (accumulated) function
            compose(transpose('minor third up'), augment(2/1))
        and - if applicable - inverse function
            compose(augment(1/2), transpose('minor third down'))
    then the lens is like:
        R.lens(
            R.pipe(R.path(thePath), theFunction),
            R.pipe(theReverseFunction, R.assocPath(thePath))
        )
    future thoughts:
        when writing to a variable or function, select
            overwriting original variable
            create a new function with single-modifications
            remove link to function/variable and make the notes part of sequence

*/

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