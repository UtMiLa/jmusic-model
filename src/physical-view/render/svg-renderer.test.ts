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
            { type: DrawOperationType.Stroke }
        ]);

        const res = '<path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#123456;" d="M 100 143 L 170 143"/>';

        expect(svg.firstElementChild?.children).to.have.length(1);
        const str = serializeToString(svg.firstElementChild?.firstElementChild);

        expect(str).to.eq(res);
    });

    it('should fill a polygon on an svg', () => {
        renderer.draw('#123456', '#abcdef', [
            { type: DrawOperationType.MoveTo, points: [{ x: 100, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 170, y: 143 }] },
            { type: DrawOperationType.LineTo, points: [{ x: 100, y: 243 }] },
            { type: DrawOperationType.Fill }
        ]);

        const res = '<path xmlns="http://www.w3.org/2000/svg" style="fill:#abcdef;stroke:none;" d="M 100 143 L 170 143 L 100 243 z"/>';

        expect(svg.firstElementChild?.children).to.have.length(1);
        const str = serializeToString(svg.firstElementChild?.firstElementChild);

        expect(str).to.eq(res);
    });

    it('should draw a curve on an svg', () => {

        renderer.lineWidth = 2.8;

        renderer.draw('#234567', '#988765', [
            { type: DrawOperationType.MoveTo, points: [{ x: 100, y: 143 }] },
            { type: DrawOperationType.CurveTo, points: [{ x: 170, y: 143 }, { x: 120, y: 103 }, { x: 130, y: 183 }] },
            { type: DrawOperationType.Stroke }
        ], true);


        const res = '<path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#234567;" d="M 100 143 C 170 143,120 103,130 183"/>';

        expect(svg.firstElementChild?.children).to.have.length(1);
        const str = serializeToString(svg.firstElementChild?.firstElementChild);

        expect(str).to.eq(res);
    });

    // todo: no font?
    // todo: complex objects: more than one path, or path combined with text
    
    it('should draw text on an svg', () => {
        renderer.draw('#234567', '#988765', [
            { type: DrawOperationType.Text, points: [{ x: 100, y: 143 }], text: 'Hello',
                fontFamily: 'blah',
                fontSize: 20 
            }
        ],
        false);

        const res = '<text xmlns="http://www.w3.org/2000/svg" style="font-family:&apos;blah&apos;;font-size:20px;fill:#988765;stroke:none;" x="100" y="143">Hello</text>';

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
            { type: DrawOperationType.Text, points: [{ x: 100, y: 143 }], text: 'Hello',
                fontFamily: 'blah',
                fontSize: 10 
            }
        ],
        false);

        renderer.clear('white');
        
        expect(svg.firstElementChild?.children).to.have.length(0);        
    });

});
