import { AbsoluteTime, ExtendedTime } from './../rationals/time';
export enum EventType {
    Note = 1,
    Bar, KeyChg, MeterChg, ClefChg,
    Lyric, Expression,
    GraceNote, GraceNoteAfter
}

export function getExtendedTime(time: AbsoluteTime, eventType: EventType, graceIndex = 0): ExtendedTime {
    switch (eventType) {
        case EventType.Note: 
        case EventType.Lyric: 
        case EventType.Expression: 
            return time;
        case EventType.Bar: 
        case EventType.KeyChg: 
        case EventType.MeterChg: 
        case EventType.ClefChg: 
            // todo: cure a weakness in the model: it fails in the unlikely case of more than 5000 grace notes in a row
            return {...time, extended: -15000 };
        case EventType.GraceNote:
            return {...time, extended: -10000 + graceIndex };
        case EventType.GraceNoteAfter:
            return {...time, extended: -20000 + graceIndex };
    }
    throw 'Unknown event type: ' + eventType;
}