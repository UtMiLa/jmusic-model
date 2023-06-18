import { parseLilyKey } from "..";
import { Key, KeyDef } from "../states/key";

/** Tolerant input type for key: a Key object, a KeyDef definition, or a string in Lilypond format */
export type KeyFlex = Key | KeyDef | string;


export function makeKey(input: KeyFlex): KeyDef {
    if (typeof (input) === 'string') {
        return parseLilyKey('\\key ' + input.replace(' major', ' \\major').replace(' minor', ' \\minor')).def;
    }
    const cd = input as KeyDef;
    if (cd.accidental !== undefined && cd.count !== undefined ) {
        return cd;
    }
    return (input as Key).def;
}

