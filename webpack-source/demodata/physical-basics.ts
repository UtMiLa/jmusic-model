import { HorizVarSizeGlyphs, VertVarSizeGlyphs } from '../../src/physical-view';
import { NoteType, NoteDirection, StaffDef, ClefType, Time } from '../../src/model';

const lineWidth = 6;

export const physBasics = { elements: [
    {
        element: VertVarSizeGlyphs.Line,
        position: { x: 0, y: 4 * lineWidth },
        length: 130
    },
    {
        element: VertVarSizeGlyphs.Line,
        position: { x: 0, y: 3 * lineWidth },
        length: 130
    },
    {
        element: VertVarSizeGlyphs.Line,
        position: { x: 0, y: 2 * lineWidth },
        length: 130
    },
    {
        element: VertVarSizeGlyphs.Line,
        position: { x: 0, y: lineWidth },
        length: 130
    },
    {
        element: VertVarSizeGlyphs.Line,
        position: { x: 0, y: 0 },
        length: 130
    },
    {
        glyph: 'clefs.G',
        position: { x: 20, y: 1 * lineWidth  }
    },
    {
        glyph: 'three',
        //scale: 2,
        position: { x: 50, y: 2 * lineWidth  }
    },
    {
        glyph: 'four',
        //scale: 2,
        position: { x: 50, y: 0  }
    },
    {
        glyph: 'noteheads.s0',
        position: { x: 70, y: -1 * lineWidth }
    },
    {
        glyph: 'noteheads.s2',
        position: { x: 90, y: -1 * lineWidth }
    },
    {
        glyph: 'noteheads.s2',
        position: { x: 110, y: 2 * lineWidth }
    },
    {
        glyph: 'flags.d3',
        position: { x: 110, y: 2 * lineWidth - 25 }
    },
    {
        glyph: 'dots.dot',
        position: { x: 120, y: 2.5 * lineWidth }
    },
    {
        glyph: 'rests.2',
        position: { x: 130, y: 2 * lineWidth }
    },
    { 'element': 101, 'height': 25, 'position': { 'x': 90+7, 'y': -1 * lineWidth } },
    { 'element': 101, 'height': -25, 'position': { 'x': 110, 'y': 2 * lineWidth } },
    { 'element': VertVarSizeGlyphs.Tie, 'length': 10, direction: NoteDirection.Up, 'position': { 'x': 80, 'y': -1 * lineWidth - 3 } },
    {
        element: HorizVarSizeGlyphs.Bar,
        position: { x: 150, y: 0 },
        length: 4 * lineWidth
    }

] };
