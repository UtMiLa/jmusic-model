import { GlyphCode } from '../physical/glyphs';
import { VertVarSizeGlyphs, HorizVarSizeGlyphs } from './glyphs';

export interface Point {
    x: number;
    y: number;
}

export interface PhysicalElementBase {
    element?: VertVarSizeGlyphs | HorizVarSizeGlyphs;
    position: Point;
    length?: number;
    height?: number;
}

export interface PhysicalFixedSizeElement extends PhysicalElementBase {
    glyph: GlyphCode;
    scale?: number;
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
    text: string;
}

export interface PhysicalModel {
    elements: PhysicalElementBase[];
}


/*
export function ifLine<T>(element: PhysicalElementBase, (lineElem: PhysicalHorizVarSizeElement) => T): T {
    if (typeof (obj as ClefDef).clefType === 'number') {
        resultElements.push(convertClef(obj as ClefViewModel));

}*/