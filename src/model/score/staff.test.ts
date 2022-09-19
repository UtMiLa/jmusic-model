import { Key } from './../states/key';
import { Clef, ClefType } from './../states/clef';
import { VoiceDef } from './voice';
import { Time } from '../rationals/time';
import { Sequence, SequenceDef } from './sequence';
import { expect } from 'chai';
import { StaffDef } from './staff';
describe('Staff', () => {
    const seq1Text = 'c4 d8 e8';
    const seq2Text = 'c,2 d,8 e,8 c4';
    const seq3Text = 'c,2 d,8 <e, c>4';
    beforeEach(() => { 
        //
    });

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
});