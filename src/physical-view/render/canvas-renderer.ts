import { Renderer } from './base-renderer';
import { DrawOperation, DrawOperationType } from './render-types';

export class CanvasRenderer implements Renderer {

    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        if (!this.ctx) throw 'Canvas context is null';
        this.width = canvas.width;
        this.height = canvas.height;
    }

    ctx: CanvasRenderingContext2D;

    draw(operations: DrawOperation[]): void {
        this.ctx.beginPath();
        operations.forEach(operation => {
            switch(operation.type) {
                case DrawOperationType.MoveTo:
                    this.ctx.moveTo(operation.points[0].x, operation.points[0].y);
                    break;
                case DrawOperationType.LineTo:
                    this.ctx.lineTo(operation.points[0].x, operation.points[0].y);
                    break;
                case DrawOperationType.CurveTo:
                    this.ctx.bezierCurveTo(
                        operation.points[0].x, operation.points[0].y,
                        operation.points[1].x, operation.points[1].y,
                        operation.points[2].x, operation.points[2].y
                    );
                    break;
                case DrawOperationType.Text:
                    //const scale = (elem as any).scale ? (elem as any).scale : 1;
                    if (operation.font) this.ctx.font = operation.font;
                    //const glyph = emmentalerCodes[(elem as PhysicalFixedSizeElement).glyph as GlyphCode] as string;
                    this.ctx.fillText(operation.text as string, operation.points[0].x, operation.points[0].y);
                         
                    break;
                case DrawOperationType.Stroke:
                    this.ctx.stroke();
                    break;
                case DrawOperationType.Fill:
                    this.ctx.fill();
                    break;
            }
        });
    
    }

    getContext(x: string): Renderer {
        return this;
    }

    private _fillStyle = '';
    public get fillStyle() {
        return this._fillStyle;
    }
    public set fillStyle(value) {
        this._fillStyle = value;
        this.ctx.fillStyle = value;
    }
    
    private _strokeStyle = '';
    public get strokeStyle() {
        return this._strokeStyle;
    }
    public set strokeStyle(value) {
        this._strokeStyle = value;
        this.ctx.strokeStyle = value;
    }

    /*fillRect(x: number, y: number, x1: number, y1: number): void {
        this.ctx.fillRect(x, y, x1, y1);
    }*/

    clear(color: string): void {        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    width = 0;
    height = 0;

    private _lineWidth = 1;
    public get lineWidth() {
        return this._lineWidth;
    }
    public set lineWidth(value) {
        this._lineWidth = value;
        this.ctx.lineWidth = value;
    }

    private _font = '';
    public get font() {
        return this._font;
    }
    public set font(value) {
        this._font = value;
        this.ctx.font = value;
    }

    fillText(glyph: string, x: number, y: number): void {
        this.ctx.fillText(glyph, x, y);
    }

}