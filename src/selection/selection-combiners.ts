import { ElementIdentifier, MusicSelection } from './selection-types';

export function selectUnion(sel1: MusicSelection, sel2: MusicSelection): MusicSelection {
    return {
        isSelected: (element: ElementIdentifier) => sel1.isSelected(element) || sel2.isSelected(element)
    };        
}

export function selectIntersect(sel1: MusicSelection, sel2: MusicSelection): MusicSelection {
    return {
        isSelected: (element: ElementIdentifier) => sel1.isSelected(element) && sel2.isSelected(element)
    };        
}

export function selectDifference(sel1: MusicSelection, sel2: MusicSelection): MusicSelection {
    return {
        isSelected: (element: ElementIdentifier) => sel1.isSelected(element) && !sel2.isSelected(element)
    };        
}
