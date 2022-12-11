import { RenderPosition } from './render-types';
import { PhysicalElementBase } from '../physical/physical-elements';
import { Point } from '../physical/physical-elements';
import { VertVarSizeGlyphs } from '../physical/glyphs';
import { PhysicalModel } from '../physical/physical-elements';
import { HorizVarSizeGlyphs } from '../physical/glyphs';
import { Renderer } from './base-renderer';
import { CanvasRenderer } from './canvas-renderer';
import { renderBar, renderBeam, renderCursor, renderLongElement, renderStaffLine, renderStem, renderText, renderTie, renderTupletBracket } from './render-elements';



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

    function convertXY(p: Point, addVector: Point = { x: 0, y: 0 }): Point {
        return {
            x: convertX(p.x + addVector.x),
            y: convertY(p.y + addVector.y)
        };
    }

    const renderFunctions = {} as { [key: number]: (elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point) => void };
    renderFunctions[HorizVarSizeGlyphs.Stem] = renderStem;
    renderFunctions[HorizVarSizeGlyphs.Bar] = renderBar;
    renderFunctions[HorizVarSizeGlyphs.RepeatEnd] = renderBar;
    renderFunctions[HorizVarSizeGlyphs.RepeatEndStart] = renderBar;
    renderFunctions[HorizVarSizeGlyphs.RepeatStart] = renderBar;
    renderFunctions[VertVarSizeGlyphs.Line] = renderStaffLine;
    renderFunctions[VertVarSizeGlyphs.LedgerLine] = renderStaffLine;
    renderFunctions[VertVarSizeGlyphs.Beam] = renderBeam;
    renderFunctions[VertVarSizeGlyphs.TupletBracket] = renderTupletBracket;
    renderFunctions[VertVarSizeGlyphs.Crescendo] = renderLongElement;
    renderFunctions[VertVarSizeGlyphs.Decrescendo] = renderLongElement;
    //renderFunctions[VertVarSizeGlyphs.Slur] = renderTupletBracket;
    renderFunctions[VertVarSizeGlyphs.Tie] = renderTie;
    renderFunctions[HorizVarSizeGlyphs.Cursor] = renderCursor;


    physicalModel.elements.forEach(elem => {

        if (elem.element && renderFunctions[elem.element]) {

            renderFunctions[elem.element](elem, position, renderer, convertXY);

        } else {

            renderText(elem, position, renderer, convertXY);

        }

    });
}
