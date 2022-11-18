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


    physicalModel.elements.forEach(elem => {
        if ((elem as any).element === VertVarSizeGlyphs.Line || (elem as any).element === VertVarSizeGlyphs.LedgerLine) {
            renderer.lineWidth = 1.3;

            renderer.draw('#888888', '#888888', [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elem.position.x + (elem as PhysicalVertVarSizeElement).length, y: elem.position.y })]},
                { type: DrawOperationType.Stroke, points: []}
            ]);

        } else if ((elem as any).element === VertVarSizeGlyphs.Beam) {
            const elmBeam = elem as PhysicalBeamElement;

            renderer.draw('#000000', '#000000', [
                { type: DrawOperationType.MoveTo, points: [convertXY(elmBeam.position)]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height })]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x + elmBeam.length, y: elmBeam.position.y + elmBeam.height - 3})]},
                { type: DrawOperationType.LineTo, points: [convertXY({ x: elmBeam.position.x, y: elmBeam.position.y - 3 })]},
                { type: DrawOperationType.Fill, points: []}
            ]);

        } else if ((elem as any).element === VertVarSizeGlyphs.TupletBracket) {
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

        } else if ((elem as any).element === VertVarSizeGlyphs.Tie) {

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

        } else if ((elem as any).element === HorizVarSizeGlyphs.Stem) {

            renderer.draw('#222222', '#222222', [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);

        } else if ((elem as any).element === HorizVarSizeGlyphs.Bar) {

            renderer.draw('#555555', '#555555', [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);
        } else if ((elem as any).element === HorizVarSizeGlyphs.RepeatEnd) {

            const scale = (elem as any).scale ? (elem as any).scale : 1;
            const font = Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler';

            renderer.draw('#000000', '#000000', [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []},

                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x+3), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x+3), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x+5), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x+5), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.Fill, points: []},

                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x-6), y: convertY(elem.position.y + 9)}
                ], text: emmentalerCodes['dots.dot'], font: font },
                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x-6), y: convertY(elem.position.y + 15)}
                ], text: emmentalerCodes['dots.dot'], font: font }
            ]);
        } else if ((elem as any).element === HorizVarSizeGlyphs.RepeatEndStart) {

            const scale = (elem as any).scale ? (elem as any).scale : 1;
            const font = Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler';
            renderer.draw('#000000', '#000000', [
                { type: DrawOperationType.MoveTo, points: [convertXY(elem.position)]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x-2), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x-2), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.Fill, points: []},

                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x+2), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x+2), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x+4), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x+4), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.Fill, points: []},

                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x+5), y: convertY(elem.position.y + 9)}
                ], text: emmentalerCodes['dots.dot'], font: font },
                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x+5), y: convertY(elem.position.y + 15)}
                ], text: emmentalerCodes['dots.dot'], font: font },

                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x-6), y: convertY(elem.position.y + 9)}
                ], text: emmentalerCodes['dots.dot'], font: font },
                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x-6), y: convertY(elem.position.y + 15)}
                ], text: emmentalerCodes['dots.dot'], font: font }
            ]);
        } else if ((elem as any).element === HorizVarSizeGlyphs.RepeatStart) {

            const scale = (elem as any).scale ? (elem as any).scale : 1;
            const font = Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler';
            renderer.draw('#000000', '#000000', [
                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x-2), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x-2), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x-1), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x-1), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.Fill, points: []},

                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x+2), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x+2), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []},

                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x+5), y: convertY(elem.position.y + 9)}
                ], text: emmentalerCodes['dots.dot'], font: font },
                { type: DrawOperationType.Text, points: [
                    { x: convertX(elem.position.x+5), y: convertY(elem.position.y + 15)}
                ], text: emmentalerCodes['dots.dot'], font: font }

            ]);
        } else if ((elem as any).element === HorizVarSizeGlyphs.Cursor) {

            renderer.draw('#ff5555', '#ff5555', [
                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y - (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x), y: convertY(elem.position.y + (elem as PhysicalHorizVarSizeElement).height)}]},
                { type: DrawOperationType.Stroke, points: []},
                { type: DrawOperationType.MoveTo, points: [{ x: convertX(elem.position.x - 5), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.LineTo, points: [{ x: convertX(elem.position.x + 5), y: convertY(elem.position.y)}]},
                { type: DrawOperationType.Stroke, points: []}
            ]);
        } else if ((elem as any).glyph) {
            const scale = (elem as any).scale ? (elem as any).scale : 1;
            const glyph = emmentalerCodes[(elem as PhysicalFixedSizeElement).glyph as GlyphCode] as string;


            renderer.draw('#330000', '#330000', [
                { type: DrawOperationType.Text, points: [convertXY(elem.position)], text: glyph, font: Math.trunc(20 * position.scaleY * scale) + 'px Emmentaler' }
            ], false);
        }
    });
}