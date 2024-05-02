import { ElementIdentifier, Selection } from './selection-types';

export function selectUnion(sel1: Selection, sel2: Selection): Selection {
    return {
        isSelected: (element: ElementIdentifier) => sel1.isSelected(element) || sel2.isSelected(element)
    };        
}

export function selectIntersect(sel1: Selection, sel2: Selection): Selection {
    return {
        isSelected: (element: ElementIdentifier) => sel1.isSelected(element) && sel2.isSelected(element)
    };        
}

export function selectDifference(sel1: Selection, sel2: Selection): Selection {
    return {
        isSelected: (element: ElementIdentifier) => sel1.isSelected(element) && !sel2.isSelected(element)
    };        
}
