import { DrawOperation } from './render-types';
export interface Renderer {
    draw(operations: DrawOperation[]): void;
    getContext(x: string): Renderer;
    fillStyle: string;
    strokeStyle: string;
    clear(color: string): void;
    width: number;
    height: number;
    lineWidth: number;
    font: string;
    fillText(glyph: string, x: number, y: number): void;
}