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
});