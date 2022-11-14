import { StateChange } from '../../model/states/state';
import { IndexedMap } from '../../tools/time-map';
import { AbsoluteTime, ScoreDef, Time } from './../../model';


export interface ScopedTimeKey {
    absTime: AbsoluteTime;
    scope?: number;
}

export function createIdPrefix(staffNo: number, voiceNo: number): string {
    return `${staffNo}-${voiceNo}`;
}

export function createScopedTimeMap(): IndexedMap<StateChange, ScopedTimeKey> {
    return new IndexedMap<StateChange, ScopedTimeKey>((key1: ScopedTimeKey, key2: ScopedTimeKey) => {
        const cmpTime = Time.sortComparison(key1.absTime, key2.absTime);
        if (cmpTime !== 0) return cmpTime;
        if (key1.scope === key2.scope) {
            return 0;
        }
        return -1;
    });
}


export function createStateMap(score: ScoreDef):  IndexedMap<StateChange, ScopedTimeKey> {
    const stateMap = createScopedTimeMap();


    score.staves.forEach((staff, staffNo) => {
        staff.voices.forEach((voice, voiceNo) => {
            const voiceSequence = voice.content;            
            const voiceTimeSlots = voiceSequence.groupByTimeSlots(createIdPrefix(staffNo, voiceNo));
            //console.log(voiceTimeSlots);
            
            voiceTimeSlots.forEach(vts => {
                if (vts.states.length) {
                    const scopedStateChange = stateMap.get({absTime: vts.time, scope: staffNo});
                    //console.log('stateChg', stateChange);
                    
                    vts.states.forEach(st => {
                        if (st.clef) {
                            if (scopedStateChange.clef && !scopedStateChange.clef.equals(st.clef)) throw 'Two clef changes in the same staff';
                            scopedStateChange.clef = st.clef;
                            //stateChange.scope = [staffNo];
                        }
                    });

                    const stateChange = stateMap.get({absTime: vts.time, scope: undefined});
                    //console.log('stateChg', stateChange);
                    
                    vts.states.forEach(st => {

                        if (st.key) {
                            //console.log('key ch', st.key);
                            if (stateChange.key && !stateChange.key.equals(st.key)) throw 'Two key changes in the same staff';
                            stateChange.key = st.key;
                        }
                        if (st.meter) {
                            //console.log('key ch', st.key);
                            if (stateChange.meter && !stateChange.meter.equals(st.meter)) throw 'Two meter changes in the same staff';
                            stateChange.meter = st.meter;
                        }
                    });

                }
            });
        });
    
    });

    stateMap.items.sort((item1, item2) => Time.sortComparison(item1.index.absTime, item2.index.absTime));

    return stateMap
        .filter((index, value) => !!(value.meter || value.clef || value.key));
        
}

export function getStateAt(stateMap: IndexedMap<StateChange, ScopedTimeKey>, time: AbsoluteTime, staff: number): StateChange {
    let res = { meter: undefined, clef: undefined, key: undefined, duration: Time.NoTime, isState: true } as StateChange;
    for (let i = 0; i < stateMap.length; i++) {
        if (Time.sortComparison(time, stateMap.items[i].index.absTime) < 0) break;
        if (stateMap.items[i].index.scope === undefined || stateMap.items[i].index.scope === staff) {
            res = {...res, ...stateMap.items[i].value};
        }
    }
    return res;
}