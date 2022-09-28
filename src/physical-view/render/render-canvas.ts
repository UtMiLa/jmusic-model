import { NoteDirection } from './../../model';
import { Point } from './../physical/physical-elements';
import { PhysicalVertVarSizeElement } from '../physical/physical-elements';
import { GlyphCode } from '../physical/glyphs';
import { PhysicalFixedSizeElement } from '../physical/physical-elements';
import { emmentalerCodes } from '../../font/emmentaler-codes';
import { VertVarSizeGlyphs } from '../physical/glyphs';
import { PhysicalHorizVarSizeElement, PhysicalModel } from '../physical/physical-elements';
import { HorizVarSizeGlyphs } from '../physical/glyphs';

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
    Stroke,
    Fill
}

export interface DrawOperation {
    type: DrawOperationType;
    points: Point[];
}

function draw(ctx: CanvasRenderingContext2D, operations: DrawOperation[]): void {
    ctx.beginPath();
    operations.forEach(operation => {
        switch(operation.type) {
            case DrawOperationType.MoveTo:
                ctx.moveTo(operation.points[0].x, operation.points[0].y);
                break;
            case DrawOperationType.LineTo:
                ctx.lineTo(operation.points[0].x, operation.points[0].y);
                break;
            case DrawOperationType.CurveTo:
                ctx.bezierCurveTo(
                    operation.points[0].x, operation.points[0].y,
                    operation.points[1].x, operation.points[1].y,
                    operation.points[2].x, operation.points[2].y
                );
                break;
            case DrawOperationType.Stroke:
                ctx.stroke();
                break;
            case DrawOperationType.Fill:
                ctx.fill();
                break;
        }
    });
}

export function renderOnCanvas(physicalModel: PhysicalModel, canvas: HTMLCanvasElement, position: RenderPosition): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw 'Canvas context is null';

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#330000';
    ctx.strokeStyle = '#223344';//'solid black 1px';

    function convertX(x: number): number {
        return (position.offsetX + x) * position.scaleX;
    }
    
    function convertY(y: number): number {
        return (position.offsetY - y) * position.scaleY;
    }

    function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }


    physicalModel.elements.forEach(elem => {
        if ((elem as any).element === VertVarSizeGlyphs.Line || (elem as any).element === VertVarSizeGlyphs.LedgerLine) {
            ctx.strokeStyle = '#888888';

            draw(ctx, [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elem.position.x + (elem as PhysicalVertVarSizeElement).length, y: elem.position.y })]},
                { type: DrawOperationType.Stroke, points: []}
            ]);

        } else if ((elem as any).element === VertVarSizeGlyphs.Tie) {
            ctx.fillStyle = '#000000';

            const tieDir = (elem as any).direction === NoteDirection.Up ? 1 : -1;
            const tieStart = convertXY({ x: elem.position.x, y: elem.position.y });
            const tieEnd = convertXY({ x: elem.position.x + (elem as PhysicalVertVarSizeElement).length, y: elem.position.y });

            const dx = (tieEnd.x - tieStart.x)/3;
            const dy1 = tieDir * 3;
            const dy2 = tieDir * 4;//2.5;
            const dy3 = tieDir * 0.5;
            const path =[
                { type: DrawOperationType.MoveTo, points: [tieStart] },
                { type: DrawOperationType.CurveTo, points: [
                    { x: tieStart.x + dx, y: tieStart.y + dy1 },
                    { x: tieEnd.x - dx, y: tieStart.y + dy1 },
                    { x: tieEnd.x, y: tieEnd.y }
                ] },
                { type: DrawOperationType.LineTo, points: [{ x: tieEnd.x, y: tieEnd.y + dy3}] },
                { type: DrawOperationType.CurveTo, points: [
                    { x: tieEnd.x - dx, y: tieStart.y + dy2 },
                    { x: tieStart.x + dx, y: tieStart.y + dy2 },
                    { x: tieStart.x, y: tieStart.y + dy3 }
                ] },
                { type: DrawOperationType.Fill, points: []}                
            ];

            draw(ctx, path);

        } else if ((elem as any).element === HorizVarSizeGlyphs.Stem) {
            ctx.strokeStyle = '#222222';

            draw(ctx, [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalVertVarSizeElement).length)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);

        } else if ((elem as any).element === HorizVarSizeGlyphs.Bar) {
            ctx.strokeStyle = '#555555';

            draw(ctx, [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalVertVarSizeElement).length)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);
        } else if ((elem as any).glyph) {
            const scale = (elem as any).scale ? (elem as any).scale : 1;
            ctx.font = (20 * position.scaleY * scale) + 'px Emmentaler';
            const glyph = emmentalerCodes[(elem as PhysicalFixedSizeElement).glyph as GlyphCode] as string;
            ctx.fillText(glyph, convertX(elem.position.x), convertY(elem.position.y));
        }
    });
}