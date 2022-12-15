import { CanvasRenderer, ICanvasContext, ICanvasElement } from './canvas-renderer';
import { emmentalerCodes } from '../../font/emmentaler-codes';
import { expect } from 'chai';
import { PhysicalModel, PhysicalFixedSizeElement, PhysicalHorizVarSizeElement } from '../physical/physical-elements';
import { Renderer } from './base-renderer';
import { renderOnRenderer } from './render';
import { DrawOperation, DrawOperationType } from './render-types';
import * as sinon from 'sinon';
import { StandardMetrics } from '../physical/metrics';
import { FixedSizeGlyphs, HorizVarSizeGlyphs, VertVarSizeGlyphs } from '../physical/glyphs';


class MockCanvasContext implements ICanvasContext {
    fillStyle = '';
    strokeStyle = '';
    beginPath(): void {
        //throw new Error('Method not implemented.');
    }
    moveTo(x: number, y: number): void {
        //throw new Error('Method not implemented.');
    }
    lineTo(x: number, y: number): void {
        //throw new Error('Method not implemented.');
    }
    bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
        //throw new Error('Method not implemented.');
    }
    fillText(text: string, x: number, y: number): void {
        //throw new Error('Method not implemented.');
    }
    fillRect(x1: number, y1: number, x2: number, y2: number): void {
        //throw new Error('Method not implemented.');
    }
    fill(): void {
        //throw new Error('Method not implemented.');
    }
    stroke(): void {
        //throw new Error('Method not implemented.');
    }
    lineWidth = NaN;
    font = undefined;
}

class MockCanvas implements ICanvasElement {
    getContext(arg: string): ICanvasContext {
        return this.ctx;
    }
    width = 20;
    height = 30;

    ctx = new MockCanvasContext();

}

describe('Render canvas', () => {

    let canvas: MockCanvas;
    let spyObj: sinon.SinonSpiedInstance<any>;
    let renderer: CanvasRenderer;

    beforeEach(()=>{
        canvas = new MockCanvas();
        spyObj = sinon.spy(canvas.ctx);

        renderer = new CanvasRenderer(canvas);
    });

    it('should draw a line on a canvas', () => {
        renderer.draw('#123456', '#abcdef', [
            { type: DrawOperationType.MoveTo, points: [{ x: 100, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 170, y: 143 }] },
            { type: DrawOperationType.Stroke, points: [] }
        ]);

        expect(spyObj.fillStyle).to.eq('#abcdef');
        expect(spyObj.strokeStyle).to.eq('#123456');

        sinon.assert.calledOnce(spyObj.moveTo);
        sinon.assert.calledWith(spyObj.moveTo, 100, 143);
        sinon.assert.calledOnce(spyObj.lineTo);
        sinon.assert.calledWith(spyObj.lineTo, 170, 143);
        sinon.assert.notCalled(spyObj.bezierCurveTo);
        sinon.assert.calledOnce(spyObj.stroke);
        sinon.assert.notCalled(spyObj.fill);
    });

    it('should fill a polygon on a canvas', () => {
        renderer.draw('#123456', '#abcdef', [
            { type: DrawOperationType.MoveTo, points: [{ x: 100, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 170, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 100, y: 243 }] },
            { type: DrawOperationType.Fill, points: [] }
        ]);

        expect(spyObj.fillStyle).to.eq('#abcdef');
        expect(spyObj.strokeStyle).to.eq('#123456');

        sinon.assert.calledOnce(spyObj.moveTo);
        sinon.assert.calledWith(spyObj.moveTo, 100, 143);
        sinon.assert.calledTwice(spyObj.lineTo);
        sinon.assert.calledWith(spyObj.lineTo, 170, 143);
        sinon.assert.calledWith(spyObj.lineTo, 100, 243);
        sinon.assert.notCalled(spyObj.bezierCurveTo);
        sinon.assert.calledOnce(spyObj.fill);
        sinon.assert.notCalled(spyObj.stroke);
    });

    it('should draw a curve on a canvas', () => {

        renderer.lineWidth = 2.8;
        expect(renderer.lineWidth).to.eq(2.8);
        expect(spyObj.lineWidth).to.eq(2.8);

        renderer.draw('#234567', '#988765', [
            { type: DrawOperationType.MoveTo, points: [{ x: 100, y: 143 }] },
            { type: DrawOperationType.CurveTo, points: [{ x: 170, y: 143 }, { x: 120, y: 103 }, { x: 130, y: 183 }] },
            { type: DrawOperationType.Stroke, points: [] }
        ], true);


        expect(spyObj.fillStyle).to.eq('#988765');
        expect(spyObj.strokeStyle).to.eq('#234567');

        sinon.assert.calledOnce(spyObj.beginPath);
        sinon.assert.calledOnce(spyObj.moveTo);
        sinon.assert.calledWith(spyObj.moveTo, 100, 143);
        sinon.assert.notCalled(spyObj.lineTo);
        sinon.assert.calledOnce(spyObj.bezierCurveTo);
        sinon.assert.calledWith(spyObj.bezierCurveTo, 170, 143, 120, 103, 130, 183);
        sinon.assert.calledOnce(spyObj.stroke);
        sinon.assert.notCalled(spyObj.fill);
    });

    
    it('should draw text on a canvas', () => {
        renderer.draw('#234567', '#988765', [
            { type: DrawOperationType.Text, points: [{ x: 100, y: 143 }], text: 'Hello', font: 'blah' }
        ],
        false);

        expect(spyObj.fillStyle).to.eq('#988765');
        expect(spyObj.strokeStyle).to.eq('#234567');
        expect(spyObj.font).to.eq('blah');

        sinon.assert.notCalled(spyObj.beginPath);
        sinon.assert.calledOnce(spyObj.fillText);
        sinon.assert.calledWith(spyObj.fillText, 'Hello', 100, 143);
        sinon.assert.notCalled(spyObj.stroke);
        sinon.assert.notCalled(spyObj.fill);
    });
    
    
    it('should draw text on a canvas - no font', () => {
        renderer.draw('#234567', '#988765', [
            { type: DrawOperationType.Text, points: [{ x: 100, y: 143 }], text: 'Hello' }
        ],
        false);

        expect(spyObj.fillStyle).to.eq('#988765');
        expect(spyObj.strokeStyle).to.eq('#234567');
        expect(spyObj.font).to.be.undefined;

        sinon.assert.notCalled(spyObj.beginPath);
        sinon.assert.calledOnce(spyObj.fillText);
        sinon.assert.calledWith(spyObj.fillText, 'Hello', 100, 143);
        sinon.assert.notCalled(spyObj.stroke);
        sinon.assert.notCalled(spyObj.fill);
    });

    it('should clear a canvas', () => {
        renderer.clear('white');

        expect(spyObj.fillStyle).to.eq('white');

        sinon.assert.calledOnce(spyObj.fillRect);
        sinon.assert.calledWith(spyObj.fillRect, 0, 0, 20, 30);
        sinon.assert.notCalled(spyObj.stroke);
        sinon.assert.notCalled(spyObj.fill);
    });

    it('should fail if canvas has no context', () => {
        (canvas as any).ctx = null;

        expect(() => new CanvasRenderer(canvas)).to.throw();
    });
});