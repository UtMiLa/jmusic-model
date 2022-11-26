import { MeterFactory } from './../states/meter';
import { Time } from './../rationals/time';
import { Clef, ClefType } from './../states/clef';
import { expect } from 'chai';
import { JMusic } from './jmusic';

describe('Facade', () => {
    it('should create an empty score', () => {
        const sc = new JMusic();

        expect(sc.staves).to.deep.eq([]);
        expect(sc.repeats).to.be.undefined;
    });

    it('should create a one-voice one-staff score using shortcut', () => {
        const sc = new JMusic('c4 c4 c4 c4');

        expect(sc.staves).to.have.length(1);
        expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.G, line: -2 });
        expect(sc.staves[0].initialKey).to.deep.eq({ count: 0, accidental: 0 });
        expect(sc.staves[0].initialMeter).to.be.undefined;
        expect(sc.staves[0].voices).to.have.length(1);
        expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
        expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
        expect(sc.repeats).to.be.undefined;
    });
  
    it('should create a one-voice one-staff score using settings', () => {
        const sc = new JMusic({ content: [['c4 c4 c4 c4']]});

        expect(sc.staves).to.have.length(1);
        expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.G, line: -2 });
        expect(sc.staves[0].initialKey).to.deep.eq({ count: 0, accidental: 0 });
        expect(sc.staves[0].initialMeter).to.be.undefined;
        expect(sc.staves[0].voices).to.have.length(1);
        expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
        expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
        expect(sc.repeats).to.be.undefined;
    });
  
  
    it('should create a three-voice two-staff score using settings', () => {
        const sc = new JMusic({ content: [['g4 g4 g4 g4', 'c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4']]});

        expect(sc.staves).to.have.length(2);
        expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.G, line: -2 });
        expect(sc.staves[0].initialKey).to.deep.eq({ count: 0, accidental: 0 });
        expect(sc.staves[0].initialMeter).to.be.undefined;
        expect(sc.staves[0].voices).to.have.length(2);
        expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
        expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
        
        expect(sc.staves[1].initialClef).to.deep.eq({ clefType: ClefType.F, line: 2 });
        expect(sc.staves[1].initialKey).to.deep.eq({ count: 0, accidental: 0 });
        expect(sc.staves[1].initialMeter).to.be.undefined;
        expect(sc.staves[1].voices).to.have.length(1);
        expect(sc.staves[1].voices[0].content.duration).to.deep.eq(Time.WholeTime);
        expect(sc.staves[1].voices[0].content.elements).to.have.length(4);
        expect(sc.repeats).to.be.undefined;
    });
  


  
    it('should create a score with meter, key, and clef settings', () => {
        const sc = new JMusic({ 
            content: [['g4 g4 g4 g4', 'c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4']],
            meter: '6/8',
            clefs: [ 'alto', 'tenor' ], //clefs: [ Clef.clefAlto, Clef. clefTenor ],
            key: 'g \\minor'
        });

        expect(sc.staves).to.have.length(2);
        expect(sc.staves[0].initialClef).to.deep.eq({ clefType: ClefType.C, line: 0 });
        expect(sc.staves[0].initialKey).to.deep.eq({ count: 2, accidental: -1 });
        expect(sc.staves[0].initialMeter).to.deep.eq({ count: 6, value: 8 });
        expect(sc.staves[0].voices).to.have.length(2);
        expect(sc.staves[0].voices[0].content.duration).to.deep.eq(Time.WholeTime);
        expect(sc.staves[0].voices[0].content.elements).to.have.length(4);
        
        expect(sc.staves[1].initialClef).to.deep.eq({ clefType: ClefType.C, line: 2 });
        expect(sc.staves[1].initialKey).to.deep.eq({ count: 2, accidental: -1 });
        expect(sc.staves[1].initialMeter).to.deep.eq({ count: 6, value: 8 });
        expect(sc.staves[1].voices).to.have.length(1);
        expect(sc.staves[1].voices[0].content.duration).to.deep.eq(Time.WholeTime);
        expect(sc.staves[1].voices[0].content.elements).to.have.length(4);
        expect(sc.repeats).to.be.undefined;
    });
  

});