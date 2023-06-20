import R = require('ramda');
import { Subject } from 'rxjs';
import { FlexibleSequence } from './flexible-sequence';
import { FlexibleItem, VarDict, VariableDef, VariableRef } from './types';

export interface VariableRepository {
    vars: VariableDef[];
    observer$: Subject<VariableRepository>;
}

export function isVariableRef(test: unknown): test is VariableRef {
    return typeof ((test as VariableRef).variable) === 'string';
}

export function lookupVariable(repo: VariableDef[], varName: string): FlexibleItem {
    const item = repo.find(v => v.id === varName);
    if (!item) throw 'Variable not found';
    return item.value;
}

export function createRepo(vars: VariableDef[]): VariableRepository {
    return {
        vars,
        observer$: new Subject<VariableRepository>()
    };
}

export function valueOf(vars: VariableRepository, id: string): FlexibleSequence {
    //return vars.valueOf(id);
    const theVar = vars.vars.find(vd => vd.id === id);
    if (!theVar) 
        throw 'Undefined variable: ' + id;
    return new FlexibleSequence(theVar.value);
}

export function setVar(vars: VariableRepository, id: string, value: FlexibleItem): VariableRepository {
    vars.vars = R.uniqBy(R.prop('id'), [{id, value}, ...vars.vars]);
    vars.observer$.next(vars);
    return vars;
}


export function varDefArrayToVarDict(vars: VariableDef[]): VarDict {
    return R.fromPairs(vars.map(vd => [vd.id, vd.value]));
}

export function varDictToVarDefArray(vars: VarDict): VariableDef[] {
    return R.toPairs(vars).map((v: [string, FlexibleItem]) => ({ id: v[0], value: v[1] } as VariableDef));
}
