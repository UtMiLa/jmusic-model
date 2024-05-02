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
        ([selection]: [ProtoSelection]) => (model: Model, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.setSelection(selection(model, ins))
    )/*,
    commandDescriptor(  
        (sequence<ProtoSelection>(['selection +also ', SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: Model, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.unionSelection(selection(model, ins))
    ),
    commandDescriptor(  
        (sequence<ProtoSelection>(['selection +restrict ', SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: Model, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.intersectSelection(selection(model, ins))
    ),
    commandDescriptor(  
        (sequence<ProtoSelection>(['selection +except ', SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: Model, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.excludeSelection(selection(model, ins))
    )*/
];
