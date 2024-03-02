import R = require('ramda');
import { FlexibleSequence } from './flexible-sequence';
import { ISequence, ISequenceCollection } from './sequence';
import { FlexibleItem, isMultiSequence, SeqFunction } from './types';
import { VariableRepository } from './variables';
import { Spacer } from '../notes/spacer';
import { Time } from '../rationals/time';

export class MultiFlexibleSequence implements ISequenceCollection {
    
    constructor(item: FlexibleItem, repo?: VariableRepository) {
        //this.sequences = [new FlexibleSequence(item, repo)];
        this.sequences = this.calcSequences(item, repo);
    }

    calcSequences(item: FlexibleItem, repo?: VariableRepository): ISequence[] {
        if (Array.isArray(item)) {
            /*if (item.length === 0) {
                this.sequences = [];
            } else*/
            const allElements = R.map(subItem => this.calcSequences(subItem, repo), item);
            const maxSeqCount = R.reduce<ISequence[], ISequence[]>(R.maxBy((it: ISequence[]) => it.length), [], allElements);
            
            if (maxSeqCount.length > 0) {
                return R.range(0, maxSeqCount.length).map(i => {
                    const elements = allElements.map(elm => {
                        if (elm.length > i) return elm[i];
                         
                        return new FlexibleSequence({
                            duration: elm[0].duration, 
                            type: 'spacer'
                        } as Spacer, repo);
                    });
                    return new FlexibleSequence(elements.map(elm => elm.asObject), repo);
                });
            }
            return [new FlexibleSequence(item, repo)];

        } else if (isMultiSequence(item)) {
            return item.sequences.map(it => new FlexibleSequence(it as FlexibleItem), repo);
        } else {
            return [new FlexibleSequence(item, repo)];
        }

    }

    private sequences: ISequence[];

    get seqs(): ISequence[] {
        return this.sequences;
    }
}