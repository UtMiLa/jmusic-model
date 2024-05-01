import { Selection, SelectionManager } from './../../selection/selection-types';
import { sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Model } from './../../model';
import R = require('ramda');
import { commandDescriptor } from './edit-commands';
import { SelectionArg } from './selection-argument-types';





export const selectionCommands = [
    commandDescriptor(  
        (sequence<Selection>(['selection *set ',SelectionArg])), 
        ([selection]: [Selection]) => (model: Model, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.setSelection(selection)
    )
];
