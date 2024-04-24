import { Model } from './../model/model';
import { MusicEvent } from './../model/score/sequence';


export interface ISelection {
    isSelected(element: MusicEvent): boolean;
    enumerate(): Enumerator<MusicEvent>;
}

export class Selection implements ISelection {

    constructor(private model: Model) {
        //
    }

    isSelected(element: MusicEvent): boolean {
        return false;
    }

    enumerate(): Enumerator<MusicEvent> {
        return {
            atEnd() {
                return true;
            },
            item() {
                throw 'No items';
            },
            moveFirst() {
                //
            },
            moveNext() {
                return false;
            }
        };
    }
}