import R = require('ramda');
import { Subject } from 'rxjs';
import { FlexibleSequence, flexibleItemToDef } from './flexible-sequence';
import { FlexibleItem, VarDictActive, VarDictDef, VarDictFlex, VariableDef, VariableRef, VoiceContentDef } from '..';
import { record } from 'fp-ts';
import { ActiveSequence } from '../active-project/types';
import { convertActiveSequenceToData, convertSequenceDataToActive } from '../active-project/conversions';

export interface VariableRepository {
    vars: VarDictDef;
    observer$: Subject<VariableRepository>;
}

export class VariableRepositoryProxy implements VariableRepository {
    constructor() {
        //
    }

    vars: VarDictDef = {};

    assignVarDict(vars: VarDictFlex): void {
        this.vars = varDictFlexToDef(vars);
    }
    
    observer$ = new Subject<VariableRepository>;
}

export function isVariableRef(test: unknown): test is VariableRef {
    return typeof ((test as VariableRef).variable) === 'string';
}

export function lookupVariable(repo: VarDictFlex, varName: string): FlexibleItem {
    const item = repo[varName];
    if (!item) throw 'Variable not found';
    return item;
}

export function createRepo(vars: VarDictDef): VariableRepository {
    return {
        vars,
        observer$: new Subject<VariableRepository>()
    };
}
export function createRepoFromActive(vars: VarDictActive): VariableRepository {
    return createRepo(varDictActiveToDef(vars));
}

export function valueOf(vars: VariableRepository, id: string): FlexibleSequence {
    //return vars.valueOf(id);
    const theVar = vars.vars[id];
    if (!theVar) 
        throw 'Undefined variable: ' + id;
    return new FlexibleSequence(theVar, vars);
}

export function setVar(vars: VariableRepository, id: string, value: FlexibleItem): VariableRepository {
    vars.vars[id] = flexibleItemToDef(value); //R.uniqBy(R.prop('id'), [{id, value}, ...vars.vars]);
    vars.observer$.next(vars);
    return vars;
}


export function varDefArrayToVarDict(vars: VariableDef[]): VarDictFlex {
    return R.fromPairs(vars.map(vd => [vd.id, vd.value]));
}

export function varDictToVarDefArray(vars: VarDictFlex): VariableDef[] {
    return R.toPairs(vars).map((v: [string, FlexibleItem]) => ({ id: v[0], value: v[1] } as VariableDef));
}




export function varDictFlexToDef(vars: VarDictFlex): VarDictDef {
    return record.map((vdf: FlexibleItem) => flexibleItemToDef(vdf))(vars);
}

export function varDictFlexToActive(vars: VarDictFlex): VarDictActive {
    return varDictDefToActive(varDictFlexToDef(vars));
}

export function varDictDefToActive(vars: VarDictDef): VarDictActive {
    return record.map((vdf: VoiceContentDef) => convertSequenceDataToActive(vdf, vars))(vars);
}

export function varDictActiveToDef(vars: VarDictActive): VarDictDef {
    return record.map((vdf: ActiveSequence) => convertActiveSequenceToData(vdf))(vars);
}
