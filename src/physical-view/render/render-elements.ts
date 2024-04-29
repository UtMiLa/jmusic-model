import { PhysicalFixedSizeElement } from './../physical/physical-elements';
import { NoteDirection } from '../../model';
import { emmentalerCodes } from '../../font/emmentaler-codes';
import { GlyphCode, HorizVarSizeGlyphs, VertVarSizeGlyphs } from '../physical/glyphs';
import { PhysicalBeamElement, PhysicalElementBase, PhysicalHorizVarSizeElement, PhysicalTupletBracketElement, PhysicalVertVarSizeElement, Point } from '../physical/physical-elements';
import { Renderer } from './base-renderer';
import { RenderPosition, DrawOperationType, DrawOperation } from './render-types';


export function renderBar(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {
    const convertX = (x: number) => convertXY({x, y:0}).x;
    const convertY = (y: number) => convertXY({x:0, y}).y;

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


export function renderSelection(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {
    const convertX = (x: number) => convertXY({x, y:0}).x;
    const convertY = (y: number) => convertXY({x:0, y}).y;

    //const scale = (elem as any).scale ? (elem as any).scale : 1;

    const drawOp: DrawOperation[] = [
        { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y) }] },
        { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height) }] },
        { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x + (elem.length ?? 0)), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height) }] },
        { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x + (elem.length ?? 0)), y: convertY(elem.position.y) }] },
        { type: DrawOperationType.Fill, points: [] }];

    renderer.draw('#000000', '#88ff88', drawOp);
}


export function renderStem(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

    const drawOp: DrawOperation[] = [
        { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
        { type: DrawOperationType.LineTo, points: [convertXY(elem.position, {x: 0, y: (elem as PhysicalHorizVarSizeElement).height})]},
        { type: DrawOperationType.Stroke, points: []}
    ];

    renderer.draw('#222222', '#222222', drawOp);
}



export function renderStaffLine(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

    renderer.lineWidth = 1.3;

    const drawOp = [
        { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elem.position.x + (elem as PhysicalVertVarSizeElement).length, y: elem.position.y })]},
        { type: DrawOperationType.Stroke, points: []}
    ];

    renderer.draw('#888888', '#888888', drawOp);

}







export function renderBeam(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

    const elmBeam = elem as PhysicalBeamElement;

    const scale = elmBeam.scale ? elmBeam.scale : 1;

    renderer.draw('#000000', '#000000', [
        { type: DrawOperationType.MoveTo, points: [convertXY(elmBeam.position)]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height })]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height - 3 * scale })]},
        { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x, y: elmBeam.position.y - 3 * scale })]},
        { type: DrawOperationType.Fill, points: []}
    ]);
}


export function renderTie(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

    let height = 0;
    let tieYOffset = 0;
    let tieDir: number;
    let tieBow = 1;
    switch (elem.element) {
        case VertVarSizeGlyphs.SlurOver:
            tieDir = -1;
            tieBow = 3 + (elem.length as number) / 15;
            height = elem.height as number;
            tieYOffset = 5;
            break;
        case VertVarSizeGlyphs.SlurUnder:
            tieDir = -1;
            tieBow = -(3 + (elem.length as number) / 15);
            height = elem.height as number;
            tieYOffset = -5;
            break;
        case VertVarSizeGlyphs.Tie:
            tieDir = (elem as any).direction === NoteDirection.Up ? 1 : -1;
            tieBow = 3;
            break;
        default:
            throw 'Unknown tie/slur: ' + elem.element;
    }
    
    const tieStart = convertXY({ x: elem.position.x, y: elem.position.y + tieYOffset });
    const tieEnd = convertXY({ x: elem.position.x + (elem as PhysicalVertVarSizeElement).length, y: elem.position.y + tieYOffset + height });

    const dx = (tieEnd.x - tieStart.x)/3;
    const dy1 = tieDir * tieBow;
    const dy2 = tieDir * (tieBow + 1);//2.5;
    const dy3 = tieDir * 0.5;
    const path =[
        { type: DrawOperationType.MoveTo, points: [tieStart] },
        { type: DrawOperationType.CurveTo, points: [
            { x: tieStart.x + dx, y: (2*tieStart.y + tieEnd.y)/3 + dy1 },
            { x: tieEnd.x - dx, y: (tieStart.y + 2*tieEnd.y)/3 + dy1 },
            { x: tieEnd.x, y: tieEnd.y }
        ] },
        { type: DrawOperationType.LineTo, points: [{ x: tieEnd.x, y: tieEnd.y + dy3}] },
        { type: DrawOperationType.CurveTo, points: [
            { x: tieEnd.x - dx, y: (tieStart.y + 2*tieEnd.y)/3 + dy2 },
            { x: tieStart.x + dx, y: (2*tieStart.y + tieEnd.y)/3 + dy2 },
            { x: tieStart.x, y: tieStart.y + dy3 }
        ] },
        { type: DrawOperationType.Fill, points: []}                
    ];

    renderer.draw('#000000', '#000000', path);

}


export function renderTupletBracket(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

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


export function renderLongElement(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

    //const elmBeam = elem as PhysicalElement;
    //const scale = (elem as any).scale ? (elem as any).scale : 1;
    

    if (elem.element === VertVarSizeGlyphs.Crescendo) {
        renderer.draw('#606060', '#000000', [
            { type: DrawOperationType.MoveTo, points: [convertXY(elem.position, { x: elem.length as number - 2, y: 4 })]},
            { type: DrawOperationType.LineTo, points: [convertXY(elem.position, { x: 2, y: 0 })]},
            { type: DrawOperationType.LineTo, points: [convertXY(elem.position, { x: elem.length as number - 2, y: -4 })]},
            { type: DrawOperationType.Stroke, points: []}
        ]);

    } else if (elem.element === VertVarSizeGlyphs.Decrescendo) {
        renderer.draw('#606060', '#000000', [
            { type: DrawOperationType.MoveTo, points: [convertXY(elem.position, { x: 2, y: 4 })]},
            { type: DrawOperationType.LineTo, points: [convertXY(elem.position, { x: elem.length as number - 2, y: 0 })]},
            { type: DrawOperationType.LineTo, points: [convertXY(elem.position, { x: 2, y: -4 })]},
            { type: DrawOperationType.Stroke, points: []}
        ]);

    }
}



export function renderCursor(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

    renderer.draw('#ff5555', '#ff5555', [
        { type: DrawOperationType.MoveTo, points: [convertXY(elem.position, {x: 0, y: -(elem as PhysicalHorizVarSizeElement).height})]},
        { type: DrawOperationType.LineTo, points: [convertXY(elem.position, {x: 0, y:  (elem as PhysicalHorizVarSizeElement).height})]},
        { type: DrawOperationType.Stroke, points: []},
        { type: DrawOperationType.MoveTo, points: [convertXY(elem.position, {x: -5, y: 0})]},
        { type: DrawOperationType.LineTo, points: [convertXY(elem.position, {x: 5, y: 0})]},
        { type: DrawOperationType.Stroke, points: []}
    ]);
}





export function renderText(elem: PhysicalElementBase, position: RenderPosition, renderer: Renderer, convertXY: (p: Point, v?: Point) => Point): void {

    const color = (elem as any).color ?? '#330000';
    if ((elem as any).glyph) {
        const scale = (elem as any).scale ? (elem as any).scale : 1;
        const glyph = emmentalerCodes[(elem as PhysicalFixedSizeElement).glyph as GlyphCode] as string;
    
    
        renderer.draw(color, color, [
            { type: DrawOperationType.Text, points: [convertXY(elem.position)], text: glyph, font: Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler' }
        ], false);
    } else if ((elem as any).text) {
        const scale = (elem as any).scale ? (elem as any).scale : 1;
        
        renderer.draw(color, color, [
            { type: DrawOperationType.Text, points: [convertXY(elem.position)], text: (elem as any).text, font: Math.trunc((elem as any).fontSize * position.scaleY * scale) + 'px ' + (elem as any).font }
        ], false);
    }
}



