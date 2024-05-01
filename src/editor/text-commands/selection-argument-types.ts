import { SelectionAll } from './../../selection/query';
import { Selection } from './../../selection/selection-types';
import { mapResult, select } from './argument-modifiers';
import { ArgType, FixedArg } from './base-argument-types';



const SelectionAllArg: ArgType<Selection> = mapResult(FixedArg('all'), () => new SelectionAll());

export const SelectionArg: ArgType<Selection> = select([SelectionAllArg]);
