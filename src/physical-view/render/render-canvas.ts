import { DrawOperationType, DrawOperation, RenderPosition } from './render-types';
import { PhysicalTupletBracketElement } from './../physical/physical-elements';
import { NoteDirection } from './../../model';
import { Point, PhysicalBeamElement, PhysicalVertVarSizeElement } from '../physical/physical-elements';
import { GlyphCode } from '../physical/glyphs';
import { PhysicalFixedSizeElement } from '../physical/physical-elements';
import { emmentalerCodes } from '../../font/emmentaler-codes';
import { VertVarSizeGlyphs } from '../physical/glyphs';
import { PhysicalHorizVarSizeElement, PhysicalModel } from '../physical/physical-elements';
import { HorizVarSizeGlyphs } from '../physical/glyphs';
import { Renderer } from './base-renderer';
import { CanvasRenderer } from './canvas-renderer';



export function renderOnCanvas(physicalModel: PhysicalModel, canvas: HTMLCanvasElement, position: RenderPosition): void {
    renderOnRenderer(physicalModel, new CanvasRenderer(canvas), position);
}

export function renderOnRenderer(physicalModel: PhysicalModel, renderer: Renderer, position: RenderPosition): void {
    /*const ctx = canvas.getContext('2d');
    if (!ctx) throw 'Canvas context is null';*/

    /*ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);*/
    renderer.clear('white');

    renderer.fillStyle = '#330000';
    renderer.strokeStyle = '#223344';//'solid black 1px';

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
            renderer.strokeStyle = '#888888';
            renderer.lineWidth = 1.3;

            renderer.draw([
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elem.position.x + (elem as PhysicalVertVarSizeElement).length, y: elem.position.y })]},
                { type: DrawOperationType.Stroke, points: []}
            ]);

        } else if ((elem as any).element === VertVarSizeGlyphs.Beam) {
            renderer.strokeStyle = '#888888';
            const elmBeam = elem as PhysicalBeamElement;

            renderer.draw([
                { type: DrawOperationType.MoveTo, points: [convertXY(elmBeam.position)]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height })]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height - 3})]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x, y: elmBeam.position.y - 3 })]},
                { type: DrawOperationType.Fill, points: []}
            ]);

        } else if ((elem as any).element === VertVarSizeGlyphs.TupletBracket) {
            renderer.strokeStyle = '#000000';
            const elmBeam = elem as PhysicalTupletBracketElement;
            const scale = (elem as any).scale ? (elem as any).scale : 1;
            

            renderer.draw([
                { type: DrawOperationType.MoveTo, points: [convertXY(elmBeam.position)]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x, y: elmBeam.position.y + elmBeam.bracketHeight })]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height + elmBeam.bracketHeight })]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height })]},
                { type: DrawOperationType.Stroke, points: []},
                { type: DrawOperationType.Text, 
                    points: [convertXY({ x: elmBeam.position.x + elmBeam.length / 2, y: elmBeam.position.y + elmBeam.height / 2 + 2 * elmBeam.bracketHeight })], 
                    font: Math.trunc(12 * position.scaleY * scale) + 'px Emmentaler',
                    text: elmBeam.text 
                }
            ]);

        } else if ((elem as any).element === VertVarSizeGlyphs.Tie) {
            renderer.fillStyle = '#000000';

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

            renderer.draw(path);

        } else if ((elem as any).element === HorizVarSizeGlyphs.Stem) {
            renderer.strokeStyle = '#222222';

            renderer.draw([
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);

        } else if ((elem as any).element === HorizVarSizeGlyphs.Bar) {
            renderer.strokeStyle = '#555555';

            renderer.draw([
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);
        } else if ((elem as any).element === HorizVarSizeGlyphs.Cursor) {
            renderer.strokeStyle = '#ff5555';

            renderer.draw([
                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y - (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []},
                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x - 5), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x + 5), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);
        } else if ((elem as any).glyph) {
            const scale = (elem as any).scale ? (elem as any).scale : 1;
            renderer.font = Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler';
            const glyph = emmentalerCodes[(elem as PhysicalFixedSizeElement).glyph as GlyphCode] as string;
            renderer.fillText(glyph, convertX(elem.position.x), convertY(elem.position.y));
        }
    });
}