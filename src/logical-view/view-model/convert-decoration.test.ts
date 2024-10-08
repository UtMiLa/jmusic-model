import { JMusic } from '../../facade/jmusic';
import { Time } from './../../model/rationals/time';
import { LongDecorationType } from './../../model';
import { expect } from 'chai';
import { LongDecoToView as longDecoToView } from './convert-decoration';

describe('View model: Decorations', () => {

    describe('Long decorations', () => {

        let score: JMusic;

        beforeEach(() => {
            score = new JMusic({ 
                content: [['g4 g4 g4 g2 g4 g4 g4', 'c4 c4 c4 c4 \\key a \\major c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4 \\clef tenor c,4 c,4 c,4 c,4']],
                meter: '4/4',
                clefs: [ 'treble', 'bass' ],
                key: 'g \\minor'
            });
        });

        
        it('should convert a crescendo to view model', () => {
            const decrescDeco = { longDeco: LongDecorationType.Decrescendo, length: Time.HalfTime };
            const ts1 = score.staves[0].voices[1].content.groupByTimeSlots('0-1');
            const view1 = longDecoToView(decrescDeco, Time.newAbsolute(3, 4), ts1);
            expect(view1).to.deep.equal({ 
                type: LongDecorationType.Decrescendo, 
                noteRefs: [
                    { uniq: '0-1-3', absTime: Time.newAbsolute(3, 4) },
                    { uniq: '0-1-6', absTime: Time.newAbsolute(5, 4) }
                ] 
            });

            const crescDeco = { longDeco: LongDecorationType.Crescendo, length: Time.WholeTime };
            const ts2 = score.staves[0].voices[1].content.groupByTimeSlots('0-0');
            const view2 = longDecoToView(crescDeco, Time.newAbsolute(1, 2), ts2);
            expect(view2).to.deep.equal({ 
                type: LongDecorationType.Crescendo, 
                noteRefs: [
                    { uniq: '0-0-2', absTime: Time.newAbsolute(1, 2) },
                    { uniq: '0-0-7', absTime: Time.newAbsolute(3, 2) }
                ] 
            });

        });

        it('should convert a slur to view model', () => {
            const slurDeco = { longDeco: LongDecorationType.Slur, length: Time.HalfTime };
            const ts1 = score.staves[0].voices[1].content.groupByTimeSlots('0-1');
            const view1 = longDecoToView(slurDeco, Time.newAbsolute(3, 4), ts1);
            expect(view1).to.deep.equal({ 
                type: LongDecorationType.Slur, 
                noteRefs: [
                    { uniq: '0-1-3', absTime: Time.newAbsolute(3, 4) },
                    { uniq: '0-1-6', absTime: Time.newAbsolute(5, 4) }
                ] 
            });
        });
        
        it('should fail when from note not found', () => {
            const slurDeco = { longDeco: LongDecorationType.Slur, length: Time.EightsTime };
            const ts1 = score.staves[0].voices[1].content.groupByTimeSlots('0-1');
            expect(() => longDecoToView(slurDeco, Time.newAbsolute(1, 8), ts1)).to.throw('Cannot find note (LongDecoToView)');
        });

        it('should fail when to note not found', () => {
            const slurDeco = { longDeco: LongDecorationType.Slur, length: Time.EightsTime };
            const ts1 = score.staves[0].voices[1].content.groupByTimeSlots('0-1');
            expect(() => longDecoToView(slurDeco, Time.newAbsolute(3, 4), ts1)).to.throw('Cannot find note (LongDecoToView)');
        });

    });
});