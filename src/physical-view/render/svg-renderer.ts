import { Renderer } from './base-renderer';
import { DrawOperation, DrawOperationType } from './render-types';

export class SVGRenderer implements Renderer {
    constructor(private svg: SVGElement) {
        //
    }

    static xmlns = 'http://www.w3.org/2000/svg';

    draw(strokeColor: string, fillColor: string, operations: DrawOperation[], path?: boolean | undefined): void {
        const p = this.svg.ownerDocument.createElementNS(SVGRenderer.xmlns, 'path');

        let shouldFill = false;
        let shouldStroke = false;
        let pathString = '';
        let lastOperation: DrawOperationType | -1 = -1;

        operations.forEach(operation => {
            switch (operation.type) {
                case DrawOperationType.Fill:
                    pathString += ' z';
                    shouldFill = true;
                    break;
            
                case DrawOperationType.Stroke:
                    shouldStroke = true;
                    break;

                case DrawOperationType.MoveTo:
                    pathString += `M ${operation.points[0].x},${operation.points[0].y}`;
                    break;

                case DrawOperationType.LineTo:
                    pathString += ` ${operation.points[0].x},${operation.points[0].y}`;
                    break;

                case DrawOperationType.Text:
                    //     <text style="font-style:normal;font-weight:normal;font-size:10.5833px;line-height:1.25;font-family:sans-serif;fill:#000000;fill-opacity:1;stroke:none;"
                    // x="137.92667" y="126.87991">Char</text>
                    {
                        const txt = this.svg.ownerDocument.createElementNS(SVGRenderer.xmlns, 'text');
                        txt.setAttribute('style', `font-family:'Emmentaler';font-size:24px;fill:${fillColor};stroke:none;`);
                        txt.setAttribute('x', '' + operation.points[0].x);
                        txt.setAttribute('y', '' + operation.points[0].y);
                        txt.appendChild(this.svg.ownerDocument.createTextNode(operation.text ?? ''));
                        this.svg.firstElementChild?.appendChild(txt);
                    }
                    break;

                case DrawOperationType.ClosePath:
                    break;

                case DrawOperationType.CurveTo:
                    if (lastOperation !== DrawOperationType.CurveTo) pathString += ' C';
                    pathString += ` ${operation.points[0].x},${operation.points[0].y} ${operation.points[1].x},${operation.points[1].y} ${operation.points[2].x},${operation.points[2].y}`;
                    break;
            }
            lastOperation = operation.type;
        });

        if (pathString) {
            p.setAttribute('style', `fill:${ shouldFill ? fillColor : 'none' };stroke:${ shouldStroke ? strokeColor : 'none' };`);

            p.setAttribute('d', pathString);
            this.svg.firstElementChild?.appendChild(p);
        }
    }

    clear(color: string): void {
        this.svg.firstElementChild?.replaceChildren();
    }
    
    width = 0;
    height = 0;
    lineWidth = 0;

}