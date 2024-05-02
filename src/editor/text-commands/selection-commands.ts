import { Selection, SelectionManager } from './../../selection/selection-types';
import { sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { Model } from './../../model';
import R = require('ramda');
import { commandDescriptor } from './edit-commands';
import { ProtoSelection, SelectionArg } from './selection-argument-types';





export const selectionCommands = [
    commandDescriptor(  
        (sequence<ProtoSelection>(['selection +set ', SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: Model, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.setSelection(selection.actuate(model, ins))
    )
];
