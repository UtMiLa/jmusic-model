import { MeterFactory } from './../states/meter';
import { Sequence } from './../score/sequence';
import { Note } from './note';
import { expect } from 'chai';
import { calcBeamGroups } from './beaming';

describe('Beaming', () => {
    let note1: Note, note2: Note, note3: Note;
    beforeEach(() => {
        note1 = Note.parseLily('c4');
        note2 = Note.parseLily('f,2.');
        note3 = Note.parseLily('gis\'\'4');
    });

    it('should group notes according to meter', () => {
        const seq = new Sequence({ elements: 'c8 c16 c16 c8. c16 c16 c8 c16'});
        const meter = MeterFactory.createRegularMeter({ count: 1, value: 4 });

        const beamGroups = calcBeamGroups(seq, meter);

        expect(beamGroups).to.have.length(3);
        expect(beamGroups[0].notes).to.have.length(3);
        expect(beamGroups[1].notes).to.have.length(2);
        expect(beamGroups[2].notes).to.have.length(3);
    });
});