import { convertSequenceDataToActive, convertActiveSequenceToData } from '../../model/object-model-functional/conversions';
import { Selection, SelectionFunc, SelectionManager } from './../../selection/selection-types';
import { sequence } from './argument-modifiers';
import { InsertionPoint } from '../insertion-point';
import { DomainConverter, EditableView, Model, ProjectDef, ProjectLens, ScoreDef, VoiceContentDef, isNote } from './../../model';
import R = require('ramda');
import { commandDescriptor } from './edit-commands';
import { ProtoSelection, SelectionArg } from './selection-argument-types';
import { FixedArg } from './base-argument-types';
import { SelectionLens } from '../../selection/selection-lens';
import { option } from 'fp-ts';
import { ActiveSequence } from '../../model/object-model-functional/types';
import { pipe } from 'fp-ts/lib/function';
import { parseLilyNoteExpression } from '../../model/notes/note-expressions';





export const selectionCommands = [
    commandDescriptor(  
        (FixedArg(/select +clear/)), 
        () => (model: EditableView, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.clearSelection()
    ),
    commandDescriptor(  
        (sequence<ProtoSelection>([/select +set +/, SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: EditableView, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.setSelection(selection(model, ins))
    ),
    commandDescriptor(  
        (sequence<ProtoSelection>([/select +also +/, SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: EditableView, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.unionSelection(selection(model, ins))
    ),
    commandDescriptor(  
        (sequence<ProtoSelection>([/select +restrict +/, SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: EditableView, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.intersectSelection(selection(model, ins))
    ),
    commandDescriptor(  
        (sequence<ProtoSelection>([/select +except +/, SelectionArg])), 
        ([selection]: [ProtoSelection]) => (model: EditableView, ins: InsertionPoint, selMgr?: SelectionManager) => selMgr?.excludeSelection(selection(model, ins))
    ),
    commandDescriptor(  
        (sequence<string>([/selection +/, FixedArg(/\\\w+/)])), 
        ([expr]: [string]) => (model: EditableView, ins: InsertionPoint, selMgr?: SelectionManager) => 
        {
            //console.log('selection staccato');
            if (!selMgr) return;
            const expression = parseLilyNoteExpression(expr);
            //console.log('selection ok');
            
            const domainConverter: DomainConverter<VoiceContentDef, ActiveSequence> = {
                fromDef: def => convertSequenceDataToActive(def, model.vars.vars),
                toDef: events => convertActiveSequenceToData(events)
            };
            const projectLens: ProjectLens<ProjectDef> = R.lens(
                (p) => p,
                (a: ProjectDef, orig: ProjectDef) => a
            );
            //console.log('selection staccato def');

            model.overProject(projectLens, (proj: ProjectDef) => {
                //console.log('selection staccato over', proj);

                const items = pipe(
                    selMgr.get(),
                    //R.tap(console.log),
                    option.map((sel: SelectionFunc) => new SelectionLens({ isSelected: sel })),
                    //R.tap(console.log),
                    option.map((l: SelectionLens) => l.change(proj, (note) => [isNote(note) ? {...note, expressions: [...note.expressions ?? [], expression] } : note], domainConverter)),
                    //R.tap(console.log),
                    option.getOrElse(() => proj)
                );                

                //console.log('selection staccato piped', items);
                    
                return items;
            });
        }
    )
];
