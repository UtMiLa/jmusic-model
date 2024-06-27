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

        operations.forEach(operation => {
            switch (operation.type) {
                case DrawOperationType.Fill:
                    shouldFill = true;
                    pathString += ' z';
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
            }
        });

        p.setAttribute('style', `fill:${ shouldFill ? fillColor : 'none' };stroke:${ shouldStroke ? strokeColor : 'none' };`);

        p.setAttribute('d', pathString);
        this.svg.firstChild?.appendChild(p);
    }

    clear(color: string): void {
        throw new Error('Method not implemented.');
    }
    
    width = 0;
    height = 0;
    lineWidth = 0;

}