import { GlyphCode, OtherVarSizeGlyphs } from '../physical/glyphs';
import { VertVarSizeGlyphs, HorizVarSizeGlyphs } from './glyphs';

export interface Point {
    x: number;
    y: number;
}

export interface PhysicalElementBase {
    element?: VertVarSizeGlyphs | HorizVarSizeGlyphs | OtherVarSizeGlyphs;
    position: Point;
    length?: number;
    height?: number;
    scale?: number;
}

export interface PhysicalFixedSizeElement extends PhysicalElementBase {
    glyph: GlyphCode;
    scale?: number;
    color?: string;
}

export interface PhysicalTextElement extends PhysicalElementBase {
    text: GlyphCode;
    font: string;
    fontSize: number;
}

export interface PhysicalVertVarSizeElement extends PhysicalElementBase {
    element: VertVarSizeGlyphs;    
    length: number
}

export interface PhysicalHorizVarSizeElement extends PhysicalElementBase {
    element: HorizVarSizeGlyphs;    
    height: number;
}



export interface PhysicalBeamElement extends PhysicalElementBase {
    element: HorizVarSizeGlyphs;    
    length: number;
    height: number;
}

export interface PhysicalTupletBracketElement extends PhysicalElementBase {
    element: VertVarSizeGlyphs.TupletBracket;
    length: number;
    height: number;
    bracketHeight: number;
    text: string;
}

export interface PhysicalModel {
    elements: PhysicalElementBase[];
}

export const getPhysicalRect = (model: PhysicalModel): { xMin: number; xMax: number; yMin: number; yMax: number; } => {

    return model.elements.reduce(
        (prev, curr) => (
            { 
                xMin: Math.min(prev.xMin, curr.position.x), 
                xMax: Math.max(prev.xMax, curr.position.x), 
                yMin: Math.min(prev.yMin, curr.position.y), 
                yMax: Math.max(prev.yMax, curr.position.y) 
            }),
        { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity }
    );    

};

/*
export function ifLine<T>(element: PhysicalElementBase, (lineElem: PhysicalHorizVarSizeElement) => T): T {
    if (typeof (obj as ClefDef).clefType === 'number') {
        resultElements.push(convertClef(obj as ClefViewModel));

}*/