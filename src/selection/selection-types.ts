import { pipe } from 'fp-ts/lib/function';
import { Model } from './../model/model';
import { option } from 'fp-ts';


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
        throw 'Not implemented';
    }
    unionSelection(s: Selection): void {
        throw 'Not implemented';
    }
    intersectSelection(s: Selection): void {
        throw 'Not implemented';
    }
    get(): option.Option<SelectionFunc> {
        return pipe(this.selection, 
            option.fromNullable,
            option.map(sel => (element: ElementIdentifier) => sel.isSelected(element))
        );
    }

}