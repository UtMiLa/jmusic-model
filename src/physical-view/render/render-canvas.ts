import { DrawOperationType, RenderPosition } from './render-types';
import { PhysicalElementBase } from './../physical/physical-elements';
import { Point } from '../physical/physical-elements';
import { GlyphCode } from '../physical/glyphs';
import { PhysicalFixedSizeElement } from '../physical/physical-elements';
import { emmentalerCodes } from '../../font/emmentaler-codes';
import { VertVarSizeGlyphs } from '../physical/glyphs';
import { PhysicalModel } from '../physical/physical-elements';
import { HorizVarSizeGlyphs } from '../physical/glyphs';
import { Renderer } from './base-renderer';
import { CanvasRenderer } from './canvas-renderer';
import { renderBar, renderBeam, renderCursor, renderStaffLine, renderStem, renderTie, renderTupletBracket } from './render-elements';



export function renderOnCanvas(physicalModel: PhysicalModel, canvas: HTMLCanvasElement, position: RenderPosition): void {
    renderOnRenderer(physicalModel, new CanvasRenderer(canvas), position);
}

export function renderOnRenderer(physicalModel: PhysicalModel, renderer: Renderer, position: RenderPosition): void {

    renderer.clear('white');

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

    const renderFunctions = {} as { [key: number]: (elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number) => void };
    renderFunctions[HorizVarSizeGlyphs.Stem] = renderStem;
    renderFunctions[HorizVarSizeGlyphs.Bar] = renderBar;
    renderFunctions[HorizVarSizeGlyphs.RepeatEnd] = renderBar;
    renderFunctions[HorizVarSizeGlyphs.RepeatEndStart] = renderBar;
    renderFunctions[HorizVarSizeGlyphs.RepeatStart] = renderBar;
    renderFunctions[VertVarSizeGlyphs.Line] = renderStaffLine;
    renderFunctions[VertVarSizeGlyphs.LedgerLine] = renderStaffLine;
    renderFunctions[VertVarSizeGlyphs.Beam] = renderBeam;
    renderFunctions[VertVarSizeGlyphs.TupletBracket] = renderTupletBracket;
    renderFunctions[VertVarSizeGlyphs.Tie] = renderTie;
    renderFunctions[HorizVarSizeGlyphs.Cursor] = renderCursor;


    physicalModel.elements.forEach(elem => {

        if (elem.element && renderFunctions[elem.element]) {

            renderFunctions[elem.element](elem, position, renderer, convertX, convertY);

        } else if ((elem as any).glyph) {
            const scale = (elem as any).scale ? (elem as any).scale : 1;
            const glyph = emmentalerCodes[(elem as PhysicalFixedSizeElement).glyph as GlyphCode] as string;


            renderer.draw('#330000', '#330000', [
                { type: DrawOperationType.Text, points: [convertXY(elem.position)], text: glyph, font: Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler' }
            ], false);
        }
    });
}
