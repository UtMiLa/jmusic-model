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

    draw(strokeColor: string, fillColor: string, operations: DrawOperation[], path = true): void {
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        if (path) this.ctx.beginPath();
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
                case DrawOperationType.Text: {
                    //const scale = (elem as any).scale ? (elem as any).scale : 1;
                    
                    if (operation.fontFamily && operation.fontSize) this.ctx.font = operation.fontSize + 'px ' + operation.fontFamily;
                    //const glyph = emmentalerCodes[(elem as PhysicalFixedSizeElement).glyph as GlyphCode] as string;
                    this.ctx.fillText(operation.text as string, operation.points[0].x, operation.points[0].y);
                }
                    break;
                case DrawOperationType.Stroke:
                    this.ctx.stroke();
                    break;
                case DrawOperationType.Fill:
                    this.ctx.fill();
                    break;
                case DrawOperationType.ClosePath:
                    this.ctx.closePath();
                    break;
            }
        });
    
    }

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


}