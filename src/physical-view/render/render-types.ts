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
    Fill,
    ClosePath
}

export interface TextDrawOperation {
    type: DrawOperationType.Text;
    text: string;
    fontSize?: number;
    fontFamily?: string;
    points: [Point];
}

export interface OnePointDrawOperation {
    type: DrawOperationType.MoveTo | DrawOperationType.LineTo;
    points: [Point];
}

export interface CurveDrawOperation {
    type: DrawOperationType.CurveTo;
    points: [Point, Point, Point];
}

export interface ParameterlessDrawOperation {
    type: DrawOperationType.Stroke | DrawOperationType.Fill | DrawOperationType.ClosePath;
}

export type DrawOperation = TextDrawOperation | OnePointDrawOperation | CurveDrawOperation | ParameterlessDrawOperation;
/*{
    type: DrawOperationType;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    points: Point[];
}*/

