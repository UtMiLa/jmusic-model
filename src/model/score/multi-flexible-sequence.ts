import { FlexibleSequence } from './flexible-sequence';
import { ISequence, ISequenceCollection } from './sequence';
import { FlexibleItem, isMultiSequence } from './types';
import { VariableRepository } from './variables';

export class MultiFlexibleSequence implements ISequenceCollection {
    
    constructor(item: FlexibleItem, repo?: VariableRepository) {
        //this.sequences = [new FlexibleSequence(item, repo)];
        /*if (Array.isArray(item) && item.length === 0) {
            this.sequences = [];
        } else*/ if (isMultiSequence(item)) {
            this.sequences = item.sequences.map(it => new FlexibleSequence(it as FlexibleItem), repo);
            console.log('multiseq', item, this.sequences);
            
        } else {
            this.sequences = [new FlexibleSequence(item as FlexibleItem, repo)];
        }
    }

    private sequences: ISequence[];

    get seqs(): ISequence[] {
        return this.sequences;
    }
}