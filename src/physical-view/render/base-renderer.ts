import { DrawOperation } from './render-types';
export interface Renderer {
    draw(strokeColor: string, fillColor: string, operations: DrawOperation[], path?: boolean): void;
    clear(color: string): void;
    width: number;
    height: number;
    lineWidth: number;
}