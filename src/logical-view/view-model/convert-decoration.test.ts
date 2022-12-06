import { JMusic } from './../../model/facade/jmusic';
import { Time } from './../../model/rationals/time';
import { LongDecorationType } from './../../model/decorations/decoration-type';
import { expect } from 'chai';
import { LongDecoToView } from './convert-decoration';

describe('View model: Decorations', () => {

    describe('Long decorations', () => {

        let score: JMusic;

        beforeEach(() => {
            score = new JMusic({ 
                content: [['g4 g4 g4 g4 \\key a \\major g4 g4 g4 g4', 'c4 c4 c4 c4 c4 c4 c4 c4'], ['c,4 c,4 c,4 c,4 \\clef tenor c,4 c,4 c,4 c,4']],
                meter: '4/4',
                clefs: [ 'treble', 'bass' ],
                key: 'g \\minor'
            });
        });

        it('should convert a crescendo to view model', () => {
            const decrescDeco = { longDeco: LongDecorationType.Decrescendo, length: Time.HalfTime, duration: Time.NoTime };
            const ts1 = score.staves[0].voices[1].content.groupByTimeSlots('0-1');
            const view1 = LongDecoToView(decrescDeco, Time.newAbsolute(3, 4), ts1);
            expect(view1).to.deep.equal({ 
                type: LongDecorationType.Decrescendo, 
                noteRefs: [
                    { uniq: '0-1-3', absTime: Time.newAbsolute(3, 4) },
                    { uniq: '0-1-5', absTime: Time.newAbsolute(5, 4) }
                ] 
            });

            const crescDeco = { longDeco: LongDecorationType.Crescendo, length: Time.WholeTime, duration: Time.NoTime };
            const ts2 = score.staves[0].voices[1].content.groupByTimeSlots('0-0');
            const view2 = LongDecoToView(crescDeco, Time.newAbsolute(1, 2), ts2);
            expect(view2).to.deep.equal({ 
                type: LongDecorationType.Crescendo, 
                noteRefs: [
                    { uniq: '0-0-2', absTime: Time.newAbsolute(1, 2) },
                    { uniq: '0-0-6', absTime: Time.newAbsolute(3, 2) }
                ] 
            });

        });
    });
});