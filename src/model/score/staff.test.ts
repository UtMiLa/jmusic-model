import { ClefType } from './../states/clef';
import { VoiceDef } from './voice';
import { SequenceDef } from './sequence';
import { StaffDef } from './staff';
describe('Staff', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';

    it('should accept two voices', () => {
        const seq1: SequenceDef = { elements: seq1Text };
        const seq2: SequenceDef = { elements: seq2Text };
        const voice1: VoiceDef = { content: seq1 };
        const voice2: VoiceDef = { content: seq2 };
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 4 },
            initialKey: { accidental: -1, count: 1 },
            voices: [voice1, voice2]
        };
    });
    it('should accept a meter', () => {
        const seq1: SequenceDef = { elements: seq1Text };
        const voice1: VoiceDef = { content: seq1 };
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 4 },
            initialKey: { accidental: -1, count: 1 },
            initialMeter: { count: 12, value: 16 },
            voices: [voice1]
        };
    });
});