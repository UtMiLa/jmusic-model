import { emmentalerCodes } from '../../font/emmentaler-codes';
import { expect } from 'chai';
import { PhysicalModel, PhysicalFixedSizeElement, PhysicalHorizVarSizeElement } from '../physical/physical-elements';
import { Renderer } from './base-renderer';
import { renderOnRenderer } from './render';
import { DrawOperation, DrawOperationType } from './render-types';
import * as sinon from 'sinon';
import { StandardMetrics } from '../physical/metrics';
import { FixedSizeGlyphs, HorizVarSizeGlyphs, VertVarSizeGlyphs } from '../physical/glyphs';

class MockRenderer implements Renderer {
    draw(strokeColor: string, fillColor: string, operations: DrawOperation[], path?: boolean | undefined): void {
        //
    }
    clear(color: string): void {
        //
    }
    width = 100;
    height = 110;
    lineWidth = 1;

}

describe('Render', () => {
    it('should draw a model on a renderer', () => {
        const defaultMetrics = new StandardMetrics();

        const model: PhysicalModel = { elements: [{
            glyph: 'noteheads.sM1',
            position: { x: 30, y: -defaultMetrics.scaleDegreeUnit - defaultMetrics.staffTopMargin }
        } as PhysicalFixedSizeElement,
        {
            element: HorizVarSizeGlyphs.Stem,
            height: defaultMetrics.quarterStemDefaultLength,
            position: { x: 70 + defaultMetrics.halfNoteHeadLeftXOffset, y: -defaultMetrics.scaleDegreeUnit - defaultMetrics.staffTopMargin }
        } as PhysicalHorizVarSizeElement,
        {
            element: VertVarSizeGlyphs.Beam,
            height: defaultMetrics.scaleDegreeUnit,
            length: 20,
            position: { x: 30 + defaultMetrics.blackNoteHeadLeftXOffset, y: -defaultMetrics.scaleDegreeUnit + defaultMetrics.quarterStemDefaultLength -defaultMetrics.staffTopMargin }
        }
        ] };

        const renderer = new MockRenderer();
        const spyObj = sinon.spy(renderer, 'draw');

        renderOnRenderer(model, renderer, {
            offsetX: 10,
            offsetY: 20,
            scaleX: 1,
            scaleY: 1
        });

        //notehead
        expect(spyObj.calledWith('#330000', '#330000', [{ type: DrawOperationType.Text, points: [{x: 40, y: 53}], text: emmentalerCodes['noteheads.sM1'], font: '20px Emmentaler' }])).to.be.true;

        // stem
        expect(spyObj.calledWith('#222222', '#222222', [
            {
                type: 0,
                points: [
                    {
                        x: 87,
                        y: 53
                    }
                ]
            },
            {
                type: 1,
                points: [
                    {
                        x: 87,
                        y: 35
                    }
                ]
            },
            {
                type: 4,
                points: [
                ]
            }
        ])).to.be.true;

        // beam
        expect(spyObj.calledWith(
            '#000000',
            '#000000',
            [
                {
                    type: 0,
                    points: [
                        {
                            x: 46.5,
                            y: 35
                        }
                    ]
                },
                {
                    type: 1,
                    points: [
                        {
                            x: 66.5,
                            y: 32
                        }
                    ]
                },
                {
                    type: 1,
                    points: [
                        {
                            x: 66.5,
                            y: 35
                        }
                    ]
                },
                {
                    type: 1,
                    points: [
                        {
                            x: 46.5,
                            y: 38
                        }
                    ]
                },
                {
                    type: 5,
                    points: [
                    ]
                }
            ]
        )).to.be.true;
    });


    
    it('should draw a tie on a renderer', () => {
        const defaultMetrics = new StandardMetrics();

        const model: PhysicalModel = { elements: [
            {
                element: VertVarSizeGlyphs.Tie,
                height: 0,
                length: 20,
                position: { x: 35, y: 20 }
            }
        ] };

        const renderer = new MockRenderer();
        const spyObj = sinon.spy(renderer, 'draw');

        renderOnRenderer(model, renderer, {
            offsetX: 0,
            offsetY: 0,
            scaleX: 2,
            scaleY: 2
        });


        const tieStart = { x: 70, y: -40 };
        const tieEnd = { x: 110, y: -40 };
        const dy1  = -3;
        const dx = 40/3;
        const dy2 = -4;
        const dy3 = -0.5;
        // tie
        sinon.assert.calledWith(spyObj,
            '#000000',
            '#000000',
            [
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
            ]
        );
    });
    
    
    it('should draw a crescendo on a renderer', () => {
        const defaultMetrics = new StandardMetrics();

        const model: PhysicalModel = { elements: [
            {
                element: VertVarSizeGlyphs.Crescendo,
                height: 0,
                length: 20,
                position: { x: 35, y: 20 }
            }
        ] };

        const renderer = new MockRenderer();
        const spyObj = sinon.spy(renderer, 'draw');

        renderOnRenderer(model, renderer, {
            offsetX: 0,
            offsetY: 0,
            scaleX: 1,
            scaleY: 1
        });


        // cresc
        sinon.assert.calledWith(spyObj,
            '#606060', '#000000', [
                { type: DrawOperationType.MoveTo, points: [{ x: 53, y: -24 }]},
                { type: DrawOperationType.LineTo, points: [{ x: 37, y: -20 }]},
                { type: DrawOperationType.LineTo, points: [{ x: 53, y: -16 }]},
                { type: DrawOperationType.Stroke, points: []}
            ]
        );

        model.elements[0].element = VertVarSizeGlyphs.Decrescendo;

        
        renderOnRenderer(model, renderer, {
            offsetX: 0,
            offsetY: 0,
            scaleX: 1,
            scaleY: 1
        });


        // decresc
        sinon.assert.calledWith(spyObj,
            '#606060', '#000000', [
                { type: DrawOperationType.MoveTo, points: [{ x: 37, y: -24 }]},
                { type: DrawOperationType.LineTo, points: [{ x: 53, y: -20 }]},
                { type: DrawOperationType.LineTo, points: [{ x: 37, y: -16 }]},
                { type: DrawOperationType.Stroke, points: []}
            ]
        );

    });


    
    it('should draw bars and repeats on a renderer', () => {
        const defaultMetrics = new StandardMetrics();

        const model: PhysicalModel = { elements: [
            {
                element: HorizVarSizeGlyphs.Bar,
                height: 20,
                length: 0,
                position: { x: 35, y: 20 }
            },
            {
                element: HorizVarSizeGlyphs.RepeatEndStart,
                height: 20,
                length: 0,
                position: { x: 55, y: 20 }
            }
        ] };

        const renderer = new MockRenderer();
        const spyObj = sinon.spy(renderer, 'draw');

        renderOnRenderer(model, renderer, {
            offsetX: 0,
            offsetY: 0,
            scaleX: 1,
            scaleY: 1
        });


        // bar
        sinon.assert.calledWith(spyObj,
            '#000000', '#000000', [

                { type: DrawOperationType.MoveTo, points: [{ x: 35, y: -20}]},
                { type: DrawOperationType.LineTo, points: [{ x: 35, y: -40}]},
                { type: DrawOperationType.Stroke, points: []}
            ]
        );

        // repeat end/start
        sinon.assert.calledWith(spyObj,
            '#000000', '#000000', [
                { type: DrawOperationType.Text, points: [
                    { x: 49, y: -29}
                ], text: emmentalerCodes['dots.dot'], font: '20px Emmentaler' },
                { type: DrawOperationType.Text, points: [
                    { x: 49, y: -35}
                ], text: emmentalerCodes['dots.dot'], font: '20px Emmentaler' },
                { type: DrawOperationType.Text, points: [
                    { x: 60, y: -29}
                ], text: emmentalerCodes['dots.dot'], font: '20px Emmentaler' },
                { type: DrawOperationType.Text, points: [
                    { x: 60, y: -35}
                ], text: emmentalerCodes['dots.dot'], font: '20px Emmentaler' },

                { type: DrawOperationType.MoveTo, points: [{ x: 53, y: -20 }] },
                { type: DrawOperationType.LineTo, points: [{ x: 53, y: -40 }] },
                { type: DrawOperationType.LineTo, points: [{ x: 55, y: -40 }] },
                { type: DrawOperationType.LineTo, points: [{ x: 55, y: -20 }] },
                { type: DrawOperationType.Fill, points: [] },
                { type: DrawOperationType.MoveTo, points: [{ x: 57, y: -20 }] },
                { type: DrawOperationType.LineTo, points: [{ x: 57, y: -40 }] },
                { type: DrawOperationType.LineTo, points: [{ x: 59, y: -40 }] },
                { type: DrawOperationType.LineTo, points: [{ x: 59, y: -20 }] },
                { type: DrawOperationType.Fill, points: [] }
                
            ]
        );

        // staffline cursor text tuplet slur
    });
});