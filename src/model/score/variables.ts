import R = require('ramda');
import { Subject } from 'rxjs';
import { FlexibleItem } from './flexible-sequence';
export interface VariableDef {
    id: string;
    value: FlexibleItem;
}

export interface VariableRef {
    variable: string;
}

export class VariableRepository {
    constructor(private vars: VariableDef[]) {}

    observer$ = new Subject<VariableRepository>();

    valueOf(id: string): FlexibleItem {
        const theVar = this.vars.find(vd => vd.id === id);
        if (!theVar) throw 'Undefined variable: ' + id;
        return theVar.value;
    }

    setVar(id: string, value: FlexibleItem): void {
        this.vars = R.uniqBy(R.prop('id'), [{id, value}, ...this.vars]);
        this.observer$.next(this);
    }
}


export function isVariableRef(test: unknown): test is VariableRef {
    return typeof ((test as VariableRef).variable) === 'string';
}
