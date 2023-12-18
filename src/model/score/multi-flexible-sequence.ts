import { FlexibleSequence } from './flexible-sequence';
import { ISequence } from './sequence';
import { FlexibleItem, MultiFlexibleItem, isMultiSequence } from './types';

export class MultiFlexibleSequence {
    constructor(item: MultiFlexibleItem) {
        if (Array.isArray(item) && item.length === 0) {
            this.sequences = [];
        } else if (isMultiSequence(item)) {
            this.sequences = item.sequences.map(it => new FlexibleSequence(it as FlexibleItem));
        } else {
            this.sequences = [new FlexibleSequence(item as FlexibleItem)];
        }
    }

    private sequences: ISequence[];

    get seqs(): ISequence[] {
        return this.sequences;
    }
}