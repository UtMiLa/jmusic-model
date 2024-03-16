export enum NoteType {
    NBreve = 1, NWhole, NHalf, NQuarter,
    RBreve, RWhole, RHalf, RQuarter, R8, R16, R32, R64, R128
}

export enum NoteDirection {
    Undefined = 0, Up = 1, Down = 2
}

export enum TupletState {
    None, Begin, Inside, End
}


export type NoteDef = string;
