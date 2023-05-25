import { ClefType } from './../states/clef';
import { VoiceDef } from './voice';
import { SequenceDef } from './sequence';
import { StaffDef } from './staff';
import { FlexibleSequence as SimpleSequence } from '../../model';
describe('Staff', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';

    it('should accept two voices', () => {
        const voice1: VoiceDef = { content: new SimpleSequence(seq1Text) };
        const voice2: VoiceDef = { content: new SimpleSequence(seq2Text) };
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 4 },
            initialKey: { accidental: -1, count: 1 },
            voices: [voice1, voice2]
        };
    });
    it('should accept a meter', () => {
        const voice1: VoiceDef = { content: new SimpleSequence(seq1Text) };
        const staff: StaffDef = { 
            initialClef: { clefType: ClefType.G, line: 4 },
            initialKey: { accidental: -1, count: 1 },
            initialMeter: { count: 12, value: 16 },
            voices: [voice1]
        };
    });
});