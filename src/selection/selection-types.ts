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

export interface Selection {
    isSelected(element: ElementIdentifier): boolean;
}

export class SelectionManager {
    private selection: Selection | undefined;
    setSelection(s: Selection): void {
        this.selection = s;
    }
    clearSelection(): void {
        this.selection = undefined;
    }
    excludeSelection(s: Selection): void {
        this.selection = this.selection ? selectDifference(this.selection, s) : this.selection;
    }
    unionSelection(s: Selection): void {
        this.selection = this.selection ? selectUnion(this.selection, s) : s;
    }
    intersectSelection(s: Selection): void {
        this.selection = this.selection ? selectIntersect(this.selection, s) : this.selection;
    }
    get(): option.Option<SelectionFunc> {
        return pipe(this.selection, 
            option.fromNullable,
            option.map(sel => (element: ElementIdentifier) => sel.isSelected(element))
        );
    }

}