import { parseLilyClef } from "..";
import { Clef, ClefDef } from "../states/clef";

/** Tolerant input type for clefs: a Clef object, a ClefDef definition, or a string in Lilypond format */
export type ClefFlex = Clef | ClefDef | string;

export function makeClef(input: ClefFlex): ClefDef {
    if (typeof (input) === 'string') {
        return parseLilyClef(input).def;
    }
    const cd = input as ClefDef;
    if (cd.clefType !== undefined && cd.line !== undefined ) {
        return cd;
    }
    return (input as Clef).def;
}
