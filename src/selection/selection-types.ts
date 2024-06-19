import { pipe } from 'fp-ts/lib/function';
import { Model } from './../model/model';
import { option } from 'fp-ts';
import { selectDifference, selectIntersect, selectUnion } from './selection-combiners';


export interface ElementIdentifier {
    staffNo: number;
    voiceNo: number;
    elementNo: number;
}

export interface SelectionFunc {
    (element: ElementIdentifier): boolean;
}

export interface MusicSelection {
    isSelected(element: ElementIdentifier): boolean;
}

export class SelectionManager {
    private selection: MusicSelection | undefined;
    setSelection(s: MusicSelection): void {
        this.selection = s;
    }
    clearSelection(): void {
        this.selection = undefined;
    }
    excludeSelection(s: MusicSelection): void {
        this.selection = this.selection ? selectDifference(this.selection, s) : this.selection;
    }
    unionSelection(s: MusicSelection): void {
        this.selection = this.selection ? selectUnion(this.selection, s) : s;
    }
    intersectSelection(s: MusicSelection): void {
        this.selection = this.selection ? selectIntersect(this.selection, s) : this.selection;
    }
    get(): option.Option<SelectionFunc> {
        return pipe(this.selection, 
            option.fromNullable,
            option.map(sel => (element: ElementIdentifier) => sel.isSelected(element))
        );
    }

}