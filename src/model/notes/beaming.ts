import { Time, AbsoluteTime } from './../rationals/time';
import { getDuration, ISequence, isLongDecoration, isStateChange } from './../score/sequence';
import { getNominalDuration, getUndottedDuration, Note, setNoteId } from './note';
import { isSpacer } from './spacer';


export interface BeamDef {
    fromIdx: number | undefined;
    toIndex: number | undefined;
    level: number;
}

export interface BeamGroup {
    notes: Note[];
    beams: BeamDef[];
}

function beamCount(denominator: number): number {
    switch(denominator) {
        case 1: case 2: case 4: return 0;
        case 8: return 1;
        case 16: return 2;
        case 32: return 3;
        case 64: return 4;
        case 128: return 5;
        case 256: return 6;
        default: throw 'Illegal denominator: ' + denominator;
    }
}


export function calcBeamGroups(seq: ISequence, meterIterator: IterableIterator<AbsoluteTime>, keyPrefix = ''): BeamGroup[] {
    //const meterIterator = getAllBeats(meter);
    let nextBeat = meterIterator.next().value;
    const grouping: BeamGroup[] = [];
    let tempGroup: Note[] = [];
    let tempSubGroups: BeamDef[] = [];
    let tempGraceGroup: Note[] = [];
    let tempGraceSubGroups: BeamDef[] = [];
    let subGroups: BeamDef[] = [];
    let graceSubGroups: BeamDef[] = [];
    let time = Time.newAbsolute(0, 1);
    let prevBeamCnt = 0;
    let prevGraceBeamCnt = 0;
    let noteIdx = 0;
    let graceNoteIdx = 0;

    function finishSubgroup() {
        prevBeamCnt--;
        const subGrp = tempSubGroups.pop() as BeamDef;
        subGrp.toIndex = noteIdx - 1;
        if (subGrp.fromIdx === subGrp.toIndex) {
            if (subGrp.fromIdx === 0) {
                subGrp.toIndex = undefined;
            } else {
                subGrp.fromIdx = undefined;
            }
        }
        if (subGrp.level)
            subGroups.push(subGrp);
    }

    function finishGraceSubgroup() {
        prevGraceBeamCnt--;
        const subGrp = tempGraceSubGroups.pop() as BeamDef;
        subGrp.toIndex = graceNoteIdx - 1;
        if (subGrp.fromIdx === subGrp.toIndex) {
            if (subGrp.fromIdx === 0) {
                subGrp.toIndex = undefined;
            } else {
                subGrp.fromIdx = undefined;
            }
        }
        if (subGrp.level)
            graceSubGroups.push(subGrp);
    }

    function finishGroup() {
        while (prevBeamCnt >= 1) {
            // end a subgroup
            finishSubgroup();
        }

        if (tempGroup.length >= 2) {
            grouping.push({ 
                notes: tempGroup, 
                beams: [{    
                    fromIdx: 0,
                    toIndex: tempGroup.length - 1,
                    level: 0
                }, ...subGroups] 
            });
        }
    }

    function finishGraceGroup() {
        while (prevGraceBeamCnt >= 1) {
            // end a subgroup
            finishGraceSubgroup();
        }

        if (tempGraceGroup.length >= 2) {
            const beams = [];
            for (let i = 0; i < beamCount(getNominalDuration(tempGraceGroup[0]).denominator); i++) {
                beams.push({    
                    fromIdx: 0,
                    toIndex: tempGraceGroup.length - 1,
                    level: i
                });
            }

            if (graceSubGroups.length) {
                beams.push(...graceSubGroups);
            }

            grouping.push({ 
                notes: tempGraceGroup, 
                beams
            });
        }
    }

    seq.elements.forEach((element, elmIndex) => {
        if (isStateChange(element)) {
            // state change
            //const stC = element as StateChange;
        } else if (isLongDecoration(element)) {
            // decoration
            //const deco = element as LongDecorationElement;
        } else if (isSpacer(element)) {
            // decoration
            //const deco = element as LongDecorationElement;
        } else {
            const note = element;

            const currBeamCnt = note.pitches.length && beamCount(getUndottedDuration(note).denominator);

            if (note.grace) {
                tempGraceGroup.push(setNoteId(note, keyPrefix, elmIndex));

                while (currBeamCnt > prevGraceBeamCnt) {
                    // start a subgroup
                    tempGraceSubGroups.push({ fromIdx: graceNoteIdx, toIndex: undefined, level: prevGraceBeamCnt });
                    prevGraceBeamCnt++;
                } 
                while (currBeamCnt < prevGraceBeamCnt && prevGraceBeamCnt >= 1) {
                    // end a subgroup
                    finishGraceSubgroup();
                    //tempGraceSubGroups = [];
                }
                prevGraceBeamCnt = currBeamCnt;
                graceNoteIdx++;
                return;
            }
            prevGraceBeamCnt = 0;
            graceNoteIdx = 0;
            if (tempGraceGroup.length) {
                finishGraceGroup();
                tempGraceGroup = [];
            }
            tempGraceSubGroups = [];
            graceSubGroups = [];

            const isOnNextBeat = Time.sortComparison(time, nextBeat) >= 0;
            if (isOnNextBeat || currBeamCnt === 0 || !note.pitches.length) {
                // new beat, or quarter note, or rest
                //console.log('new beat', time, nextBeat, tempGroup);
    
                if (Time.sortComparison(time, nextBeat) === 0 || !isOnNextBeat) {
                    // beams should go across beats when there is no note exactly on the beat (e.g. tuplets)
                    finishGroup();
    
                    tempGroup = [];
                    tempSubGroups = [];
                    subGroups = [];
                    noteIdx = 0;    
                }

                if (isOnNextBeat) {
                    while (Time.sortComparison(time, nextBeat) >= 0)
                        nextBeat = meterIterator.next().value;
                }
            }
            if (currBeamCnt > 0 && note.pitches.length) {
                tempGroup.push(setNoteId(note, keyPrefix, elmIndex));
            }
    
            while (currBeamCnt > prevBeamCnt) {
                // start a subgroup
                if (prevBeamCnt === 0) noteIdx = 0;
                tempSubGroups.push({ fromIdx: noteIdx, toIndex: undefined, level: prevBeamCnt });
                prevBeamCnt++;
            } 
            while (currBeamCnt < prevBeamCnt && prevBeamCnt >= 1) {
                // end a subgroup
                finishSubgroup();
            }
            prevBeamCnt = currBeamCnt;
    
    
            noteIdx++;
    
    
        }
        time = Time.addTime(time, getDuration(element));

    });

    finishGroup();

    //console.log('tempGroup', time, tempGroup);

    return grouping;

}

export const __beaming_internal = { beamCount };
/*
8 16 16 16 8 16
-------  ------
   ----  -    -
cur < prev: add new subgroup
cur = prev: continue subgroups
cur > prev: stop subgroup (if subgroup.length = 1: calc direction)


         8   16    32       32      32      32      16        8      32       32
grp 
subgrp       [1-]  [1-,2-] [1-,2-] [1-,2-] [1-,2-] [1-,2-5] [1-6]    [9-,9-] [9-,9-]  [9-10,9-10]
*/

/*
if grace and denom > 4:
    if existing grace group:
        add to grace group
    else:
        create new grace group and add to this
    subgroups should work like normal subgroups, except ignoring metric rules
    p.t. workaround about subgroups: only groups grace notes with same denominator together
if not grace:
    if existing grace group:
        close grace group, and clear it
    continue with normal beaming strategy as above
*/