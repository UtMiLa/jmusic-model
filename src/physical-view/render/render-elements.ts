import { emmentalerCodes } from '../../font/emmentaler-codes';
import { HorizVarSizeGlyphs } from '../physical/glyphs';
import { PhysicalElementBase, PhysicalHorizVarSizeElement, Point } from '../physical/physical-elements';
import { Renderer } from './base-renderer';
import { RenderPosition, DrawOperationType, DrawOperation } from './render-types';


export function renderBar(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number): void {
    

    function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }

    const scale = (elem as any).scale ? (elem as any).scale : 1;
    const font = Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler';

    let drawOp: DrawOperation[] = [];


    function thinBar(x: number) {
        return [
            { type: DrawOperationType.MoveTo, points: [{ x: convertX(x), y: convertY(elem.position.y)}]},
            { type: DrawOperationType.LineTo, points: [{ x: convertX(x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
            { type: DrawOperationType.Stroke, points: []}
        ];
    }

    function thickBar(x: number) {
        return [
            { type: DrawOperationType.MoveTo, points: [{ x: convertX(x), y: convertY(elem.position.y) }] },
            { type: DrawOperationType.LineTo, points: [{ x: convertX(x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height) }] },
            { type: DrawOperationType.LineTo, points: [{ x: convertX(x + 2), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height) }] },
            { type: DrawOperationType.LineTo, points: [{ x: convertX(x + 2), y: convertY(elem.position.y) }] },
            { type: DrawOperationType.Fill, points: [] }
        ];
    }


    if (elem.element === HorizVarSizeGlyphs.RepeatEnd || elem.element === HorizVarSizeGlyphs.RepeatEndStart) {
        drawOp = drawOp.concat([
            { type: DrawOperationType.Text, points: [
                { x: convertX(elem.position.x-6), y: convertY(elem.position.y + 9)}
            ], text: emmentalerCodes['dots.dot'], font: font },
            { type: DrawOperationType.Text, points: [
                { x: convertX(elem.position.x-6), y: convertY(elem.position.y + 15)}
            ], text: emmentalerCodes['dots.dot'], font: font }
        ]);
    }

    if (elem.element === HorizVarSizeGlyphs.RepeatStart || elem.element === HorizVarSizeGlyphs.RepeatEndStart) {
        drawOp = drawOp.concat([
            {
                type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x + 5), y: convertY(elem.position.y + 9) }
                ], text: emmentalerCodes['dots.dot'], font: font
            },
            {
                type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x + 5), y: convertY(elem.position.y + 15) }
                ], text: emmentalerCodes['dots.dot'], font: font
            }
            
        ]);
    }


    if (elem.element === HorizVarSizeGlyphs.RepeatStart) {
        drawOp = drawOp.concat(thinBar(elem.position.x + 2));
    }

    if (elem.element === HorizVarSizeGlyphs.Bar || elem.element === HorizVarSizeGlyphs.RepeatEnd) {
        drawOp = drawOp.concat(thinBar(elem.position.x));
    }


    if (elem.element === HorizVarSizeGlyphs.RepeatStart) {
        drawOp = drawOp.concat(thickBar(elem.position.x - 2));
    }

    if (elem.element === HorizVarSizeGlyphs.RepeatEnd) {
        drawOp = drawOp.concat(thickBar(elem.position.x + 2));
    }


    if (elem.element === HorizVarSizeGlyphs.RepeatEndStart) {
        drawOp = drawOp.concat(thickBar(elem.position.x - 2));
        drawOp = drawOp.concat(thickBar(elem.position.x + 2));
    }


    renderer.draw('#000000', '#000000', drawOp);
}


export function renderStem(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number): void {

    function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }

    //const scale = (elem as any).scale ? (elem as any).scale : 1;
    //const font = Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler';

    const drawOp: DrawOperation[] = [
        { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
        { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
        { type: DrawOperationType.Stroke, points: []}
    ];



    renderer.draw('#222222', '#222222', drawOp);

}