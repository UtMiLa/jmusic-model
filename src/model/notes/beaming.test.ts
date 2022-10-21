import { Time } from './../rationals/time';
import { getAllBeats, MeterFactory, MeterMap } from './../states/meter';
import { SimpleSequence } from './../score/sequence';
import { expect } from 'chai';
import { calcBeamGroups } from './beaming';

describe('Beaming', () => {

    it('should group notes according to meter', () => {
        const seq = new SimpleSequence( 'c8 c16 c16 c8. c16 c16 c8 c16');
        const meter = MeterFactory.createRegularMeter({ count: 1, value: 4 });

        const beamGroups = calcBeamGroups(seq, getAllBeats(meter));

        expect(beamGroups).to.have.length(3);
        expect(beamGroups[0].notes).to.have.length(3);
        expect(beamGroups[1].notes).to.have.length(2);
        expect(beamGroups[2].notes).to.have.length(3);
    });

    it('should ignore quarters and longer', () => {
        const seq = new SimpleSequence( 'c8 c8 c4 c4 c2 c8 c8 c1');
        const meter = MeterFactory.createRegularMeter({ count: 1, value: 2 });

        const beamGroups = calcBeamGroups(seq, getAllBeats(meter));

        expect(beamGroups).to.have.length(2);
        expect(beamGroups[0].beams).to.deep.eq([{    
            fromIdx: 0,
            toIndex: 1,
            level: 0
        }]);
        expect(beamGroups[0].notes).to.have.length(2);

        expect(beamGroups[1].beams).to.deep.eq([{    
            fromIdx: 0,
            toIndex: 1,
            level: 0
        }]);
        expect(beamGroups[1].notes).to.have.length(2);
    });

    
    it('should ignore rests', () => {
        const seq = new SimpleSequence( 'c8 r8 c8 r8');
        const meter = MeterFactory.createRegularMeter({ count: 1, value: 2 });

        const beamGroups = calcBeamGroups(seq, getAllBeats(meter));

        expect(beamGroups).to.have.length(0);
    });



    it('should add extra beams for 16th and shorter', () => {
        const seq = new SimpleSequence( 'c16 c16 c16 c16 c32 c32 c32 c32');
        const meter = MeterFactory.createRegularMeter({ count: 1, value: 4 });

        const beamGroups = calcBeamGroups(seq, getAllBeats(meter));

        expect(beamGroups).to.have.length(2);
        expect(beamGroups[0].beams).to.deep.eq([{
            fromIdx: 0,
            toIndex: 3,
            level: 0
        },{    
            fromIdx: 0,
            toIndex: 3,
            level: 1
        }]);
        expect(beamGroups[0].notes).to.have.length(4);

        expect(beamGroups[1].beams).to.deep.eq([{
            fromIdx: 0,
            toIndex: 3,
            level: 0
        },{    
            fromIdx: 0,
            toIndex: 3,
            level: 2
        },{    
            fromIdx: 0,
            toIndex: 3,
            level: 1
        }]);
        expect(beamGroups[1].notes).to.have.length(4);
    });


    it('should add subbeams according to note values', () => {
        const seq = new SimpleSequence( 'c8 c16 c16 c8. c16 c16 c8 c16');
        const meter = MeterFactory.createRegularMeter({ count: 1, value: 4 });

        const beamGroups = calcBeamGroups(seq, getAllBeats(meter));

        expect(beamGroups).to.have.length(3);
        expect(beamGroups[0].beams[0]).to.deep.eq({
            fromIdx: 0,
            toIndex: 2,
            level: 0
        });
        expect(beamGroups[0].beams).to.deep.eq([{    
            fromIdx: 0,
            toIndex: 2,
            level: 0
        }, {    
            fromIdx: 1,
            toIndex: 2,
            level: 1
        }]);
    });

    it('should change meter correctly', () => {
        const seq = new SimpleSequence( 'c2. \\meter 6/8 c8 c8 c8 c8 c8 c8');
        //const meter = MeterFactory.createRegularMeter({ count: 3, value: 4 });

        const meterMap = new MeterMap();
        meterMap.add(Time.newAbsolute(1, 0), MeterFactory.createRegularMeter({ count: 3, value: 4 }));
        meterMap.add(Time.newAbsolute(3, 4), MeterFactory.createRegularMeter({ count: 6, value: 8 }));


        const iter = meterMap.getAllBeats();
        expect(iter.next()).to.deep.eq({ done: false, value: Time.newAbsolute(1, 4)});
        expect(iter.next()).to.deep.eq({ done: false, value: Time.newAbsolute(1, 2)});
        expect(iter.next()).to.deep.eq({ done: false, value: Time.newAbsolute(3, 4)});
        expect(iter.next()).to.deep.eq({ done: false, value: Time.newAbsolute(9, 8)});
        expect(iter.next()).to.deep.eq({ done: false, value: Time.newAbsolute(3, 2)});

        const beamGroups = calcBeamGroups(seq, meterMap.getAllBeats());

        expect(beamGroups).to.have.length(2);
        expect(beamGroups[0].beams[0]).to.deep.eq({
            fromIdx: 0,
            toIndex: 2,
            level: 0
        });
        expect(beamGroups[1].beams).to.deep.eq([{    
            fromIdx: 0,
            toIndex: 2,
            level: 0
        }]);
    });

});