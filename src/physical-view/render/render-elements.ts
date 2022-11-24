import { NoteDirection } from '~/model';
import { emmentalerCodes } from '../../font/emmentaler-codes';
import { HorizVarSizeGlyphs } from '../physical/glyphs';
import { PhysicalBeamElement, PhysicalElementBase, PhysicalHorizVarSizeElement, PhysicalTupletBracketElement, PhysicalVertVarSizeElement, Point } from '../physical/physical-elements';
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



export function renderStaffLine(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number): void {

    function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }
    renderer.lineWidth = 1.3;

    const drawOp = [
        { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elem.position.x + (elem as PhysicalVertVarSizeElement).length, y: elem.position.y })]},
        { type: DrawOperationType.Stroke, points: []}
    ];

    renderer.draw('#888888', '#888888', drawOp);

}







export function renderBeam(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number): void {

    function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }
    const elmBeam = elem as PhysicalBeamElement;

    renderer.draw('#000000', '#000000', [
        { type: DrawOperationType.MoveTo, points: [convertXY(elmBeam.position)]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height })]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height - 3})]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x, y: elmBeam.position.y - 3 })]},
        { type: DrawOperationType.Fill, points: []}
    ]);
}


export function renderTie(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number): void {

    function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }
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

    renderer.draw('#000000', '#000000', path);

}


export function renderTupletBracket(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number): void {

    function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }
    const elmBeam = elem as PhysicalTupletBracketElement;
    const scale = (elem as any).scale ? (elem as any).scale : 1;
    

    renderer.draw('#000000', '#000000', [
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

}



export function renderCursor(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertX: (x: number) => number, convertY: (y: number) => number): void {

    /*function convertXY(p: Point): Point {
        return {
            x: convertX(p.x),
            y: convertY(p.y)
        };
    }*/
    renderer.draw('#ff5555', '#ff5555', [
        { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y - (elem as PhysicalHorizVarSizeElement).height)}]},
        { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
        { type: DrawOperationType.Stroke, points: []},
        { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x - 5), y: convertY(elem.position.y)}]},
        { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x + 5), y: convertY(elem.position.y)}]},
        { type: DrawOperationType.Stroke, points: []}
    ]);
}
