import { HorizVarSizeGlyphs, VertVarSizeGlyphs } from '../../src/physical-view';
import { NoteType, NoteDirection, StaffDef, ClefType, Time } from '../../src/model';

const lineWidth = 6;

export const physBeaming = { elements: [
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
        glyph: 'noteheads.s2',
        position: { x: 70, y: -1 * lineWidth }
    },
    { 'element': 101, 'height': 24, 'position': { 'x': 70+7, 'y': -1 * lineWidth } },

    {
        glyph: 'noteheads.s2',
        position: { x: 90, y: -1 * lineWidth }
    },
    { 'element': 101, 'height': 27, 'position': { 'x': 90+7, 'y': -1 * lineWidth } },

    {
        glyph: 'noteheads.s2',
        position: { x: 110, y: 1.5 * lineWidth }
    },
    { 'element': 101, 'height': 14, 'position': { 'x': 110+7, 'y': 1.5 * lineWidth } },

    {
        glyph: 'dots.dot',
        position: { x: 120, y: 1.5 * lineWidth }
    },
    {
        glyph: 'noteheads.s2',
        position: { x: 140, y: 1 * lineWidth }
    },
    { 'element': 101, 'height': 22, 'position': { 'x': 140+7, 'y': 1 * lineWidth } },
    { 'element': VertVarSizeGlyphs.Beam, 'length': 70, 'height': 10, 'position': { 'x': 70+7, 'y': 3 * lineWidth } },
    { 'element': VertVarSizeGlyphs.Beam, 'length': 7, 'height': 1.2, 'position': { 'x': 133+7, 'y': 3.6 * lineWidth } }

] };
