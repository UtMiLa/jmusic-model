import { expect } from 'chai';
import { DrawOperationType } from './render-types';
import * as sinon from 'sinon';
import { SVGRenderer } from './svg-renderer';
//import 'jsdom-global/register';
import * as jsdom from 'jsdom';

import { serializeToString } from 'xmlserializer';

/*class MockSVG {
    children: string[] = [];
    appendChild(child: Element) {
        this.children.push(child.innerHTML);
    }

}*/

describe('SVG renderer', () => {

    let svg: SVGElement;
    //let spyObj: sinon.SinonSpiedInstance<any>;
    let renderer: SVGRenderer;
    //const dom = new jsdom.JSDOM('<html><body></body></html>');
    
    //global.performance = jsdom.JSDOM.fragment('<svg></svg>') window.performance;
    //global.performance = window.performance;
    /*global.localStorage = {
        length: 0
    } as any;*/
    

    beforeEach(()=>{
        const dom = jsdom.JSDOM.fragment('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
        svg = dom as unknown as SVGElement;
        
        renderer = new SVGRenderer(svg);
    });

    it('should draw a line on an svg', () => {
        renderer.draw('#123456', '#abcdef', [
            { type: DrawOperationType.MoveTo, points: [{ x: 100, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 170, y: 143 }] },
            { type: DrawOperationType.Stroke, points: [] }
        ]);

        const res = '<path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#123456;" d="M 100,143 170,143"/>';

        expect(svg.firstElementChild?.children).to.have.length(1);
        const str = serializeToString(svg.firstElementChild?.firstElementChild);

        expect(str).to.eq(res);
    });

    it('should fill a polygon on an svg', () => {
        renderer.draw('#123456', '#abcdef', [
            { type: DrawOperationType.MoveTo, points: [{ x: 100, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 170, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 100, y: 243 }] },
            { type: DrawOperationType.Fill, points: [] }
        ]);

        const res = '<path xmlns="http://www.w3.org/2000/svg" style="fill:#abcdef;stroke:none;" d="M 100,143 170,143 100,243 z"/>';

        expect(svg.firstElementChild?.children).to.have.length(1);
        const str = serializeToString(svg.firstElementChild?.firstElementChild);

        expect(str).to.eq(res);
    });

    /*it('should draw a curve on an svg', () => {

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
    });*/

    
    it('should draw text on an svg', () => {
        renderer.draw('#234567', '#988765', [
            { type: DrawOperationType.Text, points: [{ x: 100, y: 143 }], text: 'Hello', font: 'blah' }
        ],
        false);

        const res = '<text xmlns="http://www.w3.org/2000/svg" style="font-family:&apos;Emmentaler&apos;;font-size:24px;fill:#988765;stroke:none;" x="100" y="143">Hello</text>';

        expect(svg.firstElementChild?.children).to.have.length(1);
        const str = serializeToString(svg.firstElementChild?.firstElementChild);

        expect(str).to.eq(res);
    });
    
    
    /*it('should draw text on an svg - no font', () => {
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
*/
    it('should clear an svg', () => {

        renderer.draw('#234567', '#988765', [
            { type: DrawOperationType.Text, points: [{ x: 100, y: 143 }], text: 'Hello', font: 'blah' }
        ],
        false);

        renderer.clear('white');
        
        expect(svg.firstElementChild?.children).to.have.length(0);        
    });

});
