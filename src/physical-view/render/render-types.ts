import { Point } from '../physical/physical-elements';

export interface RenderPosition {
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
}

export enum DrawOperationType {
    MoveTo,
    LineTo,
    CurveTo,
    Text,
    Stroke,
    Fill
}

export interface DrawOperation {
    type: DrawOperationType;
    text?: string;
    font?: string;
    points: Point[];
}

