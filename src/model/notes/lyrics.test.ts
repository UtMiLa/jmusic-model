import { TupletSequence } from './../score/transformations';
import { Time } from './../rationals/time';
import { getAllBeats, MeterFactory, MeterMap } from './../states/meter';
import { SimpleSequence } from './../score/sequence';
import { expect } from 'chai';
import { calcBeamGroups, __beaming_internal as __internal } from './beaming';
import { LyricsSequence } from './lyrics';
import { FlexibleSequence } from '../score/flexible-sequence';

describe('Lyrics', () => {

    it('should spread syllables correctly to notes', () => {
        const seq = new SimpleSequence( 'c8 c16 c16 c8. c16 c16 c8 c16');

        const lyrSeq = new LyricsSequence(seq, 'al- fa be- ta gam- ma del- ta');
        
        expect(lyrSeq.elements).to.have.length(8);
        expect(lyrSeq.elements[0]).to.deep.include({ text: ['al-']});
        expect(lyrSeq.elements[5]).to.deep.include({ text: ['ma']});
    });

    it('should ignore rests and state changes when spreading syllables to notes', () => {
        const seq = new SimpleSequence( 'c8 c16 c16 r8. \\key c \\minor c16 r16 c8 c16 c4');

        const lyrSeq = new LyricsSequence(seq, 'al- fa be- ta gam- ma del- ta');
        
        expect(lyrSeq.elements).to.have.length(10);
        expect(lyrSeq.elements[0]).to.deep.include({ text: ['al-']});
        expect(lyrSeq.elements[5]).to.deep.include({ text: ['ta']});
        expect(lyrSeq.elements[9]).to.deep.include({ text: ['del-']});
    });

    it('should ignore rests and state changes when spreading syllables to notes', () => {
        const seq = new SimpleSequence( 'c8 c16 c16 c8. c16 c16 c8 c16');

        const lyrSeq = new LyricsSequence(seq, 'al- fa be- ta gam- ma del- ta');
        const lyrSeq2 = new LyricsSequence(lyrSeq, 'e- psi- lon the- ta e- - ta');
        
        expect(lyrSeq2.elements).to.have.length(8);
        expect(lyrSeq2.elements[0]).to.deep.include({ text: ['al-', 'e-']});
        expect(lyrSeq2.elements[3]).to.deep.include({ text: ['ta', 'the-']});
        expect(lyrSeq2.elements[6]).to.deep.include({ text: ['del-', '-']});
    });


    it('should generate a working asObject', () => {
        const seq = new SimpleSequence( 'c8 c16 c16 c8. c16 c16 c8 c16');

        const lyrSeq = new LyricsSequence(seq, 'al- fa be- ta gam- ma del- ta');
        const lyrSeq2 = new LyricsSequence(lyrSeq, 'e- psi- lon the- ta e- - ta');

        const seq2 = new FlexibleSequence(lyrSeq2.asObject);
        
        expect(seq2.elements).to.have.length(8);
        expect(seq2.elements[0]).to.deep.include({ text: ['al-', 'e-']});
        expect(seq2.elements[3]).to.deep.include({ text: ['ta', 'the-']});
        expect(seq2.elements[6]).to.deep.include({ text: ['del-', '-']});
    });

});