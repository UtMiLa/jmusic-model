import { GlyphCode } from '../physical/glyphs';
import { FixedSizeGlyphs, VertVarSizeGlyphs, HorizVarSizeGlyphs } from './glyphs';

export interface Point {
    x: number;
    y: number;
}

export interface PhysicalElementBase {
    position: Point;    
}

export interface PhysicalFixedSizeElement extends PhysicalElementBase {
    glyph: GlyphCode;
}

export interface PhysicalVertVarSizeElement extends PhysicalElementBase {
    element: VertVarSizeGlyphs;    
    height: number
}

export interface PhysicalHorizVarSizeElement extends PhysicalElementBase {
    element: HorizVarSizeGlyphs;    
    length: number;
}

export interface PhysicalModel {
    elements: PhysicalElementBase[];
}


/*
export function ifLine<T>(element: PhysicalElementBase, (lineElem: PhysicalHorizVarSizeElement) => T): T {
    if (typeof (obj as ClefDef).clefType === 'number') {
        resultElements.push(convertClef(obj as ClefViewModel));

}*/