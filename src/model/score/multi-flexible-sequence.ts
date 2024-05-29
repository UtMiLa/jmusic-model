import R = require('ramda');
import { FlexibleSequence, PathElement } from './flexible-sequence';
import { ISequence, ISequenceCollection, MusicEvent } from './sequence';
import { FlexibleItem, FuncDef, isSplitSequence, MultiFlexibleItem, SeqFunction } from '..';
import { VariableRepository } from './variables';
import { Spacer } from '../notes/spacer';
import { Time } from '../rationals/time';



function applyFunctionOnSequence(funct: (a: MusicEvent) => MusicEvent, seq: ISequence): ISequence {
    return seq; /*new FlexibleSequence(
        { 
            function: 'Reverse',
            extraArgs: [],
            args: seq.asObject 
        } as SeqFunction
    );*/
}


export class MultiFlexibleSequence implements ISequenceCollection {
    constructor(item: MultiFlexibleItem, private repo?: VariableRepository) {
        //this.sequences = [new FlexibleSequence(item, repo)];
        this.sequences = this.calcSequences(item, repo);
    }

    calcSequences(item: MultiFlexibleItem, repo?: VariableRepository): ISequence[] {
        if (Array.isArray(item)) {
            /*if (item.length === 0) {
                this.sequences = [];
            } else*/
            const allElements = R.map(subItem => this.calcSequences(subItem, repo), item);
            const maxSeqCount = R.reduce<ISequence[], ISequence[]>(R.maxBy((it: ISequence[]) => it.length), [], allElements);
            
            if (maxSeqCount.length > 0) {
                return R.range(0, maxSeqCount.length).map(i => {
                    const elements = allElements.map(elm => {
                        if (elm.length > i) return applyFunctionOnSequence(event => event, elm[i]);
                         
                        return new FlexibleSequence({
                            duration: elm[0].duration, 
                            type: 'spacer'
                        } as Spacer, repo);
                    });
                    return new FlexibleSequence(elements.map(elm => elm.asObject), repo); // todo: everything here stinks!
                });
            }
            return [new FlexibleSequence(item as FlexibleItem, repo)];

        } else if (isSplitSequence(item)) {
            return item.sequences.map(it => new FlexibleSequence(it), repo);
        } else {
            return [new FlexibleSequence(item as FlexibleItem, repo)];
        }

    }

    private sequences: ISequence[];

    get seqs(): ISequence[] {
        return this.sequences;
    }

    indexToPath(element: number): PathElement<MusicEvent>[] {
        const seq = new FlexibleSequence(this.sequences[0].asObject, this.repo); // todo: get rid of seqs[0]
        return seq.indexToPath(element);
    }
}