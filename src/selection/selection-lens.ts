import { LensItem } from './../model/optics/lens';
import { JMusic } from './../model/facade/jmusic';
import { FlexibleSequence } from './../model/score/flexible-sequence';
import { ActiveSequence } from './../model/object-model-functional/types';
import { pipe } from 'fp-ts/lib/function';
import { DomainConverter, MultiSequenceDef, MusicEvent, NoteBase, ProjectDef, ScoreDef, VarDict, VoiceContentDef, createRepo, flexibleItemToDef, isMusicEvent, lensFromLensDef, projectLensByIndex, voiceContentToSequence, voiceSequenceToDef } from '../model';
import { Selection, ElementIdentifier } from './selection-types';
import { chainWithIndex, map } from 'fp-ts/Array';
import { convertActiveSequenceToData, convertSequenceDataToActive, convertSequenceItemToActive } from '../model/object-model-functional/conversions';
import { ActiveSequenceItem } from '../model/object-model-functional/types';

export class SelectionLens {
    constructor(private selection: Selection) {}

    get(source: ScoreDef, domainConverter: DomainConverter<VoiceContentDef, ActiveSequence>): VoiceContentDef {
        const result: ActiveSequence = [];
        source.staves.forEach((staff, staffNo) => {
            staff.voices.forEach((voice, voiceNo) => {
                const elements = domainConverter.fromDef(voice.contentDef);
                elements.forEach((element, elementNo) => {
                    const elementIdentifier: ElementIdentifier = {
                        staffNo, voiceNo, elementNo
                    };
                    if (this.selection.isSelected(elementIdentifier)) {
                        result.push(element); // todo: maybe more functional?
                    }
                });
            });
        });
        return domainConverter.toDef(result);
    }


    change(source: ProjectDef, modifier: (element: MusicEvent) => MusicEvent[], domainConverter: DomainConverter<VoiceContentDef, ActiveSequence>, vars: VarDict): ProjectDef {

        /*const res = new JMusic(source);
        source.score.staves.forEach((staff, staffNo) => {
            staff.voices.forEach((voice, voiceNo) => {
                const seq = new FlexibleSequence(voice.contentDef, createRepo(source.vars));
                seq.elements.forEach((elem, elemNo) => {
                    if (this.selection.isSelected({ elementNo: elemNo, staffNo: staffNo, voiceNo: voiceNo })) {
                        const lens = projectLensByIndex(domainConverter, { element: elemNo, staff: staffNo, voice: voiceNo });
                        res.overProject<LensItem>(lens, modifier);
                    }
                });
                
            });
        });


        return res.project;*/

        const result = {
            ...source, 
            score: {
                ...source.score,
                staves: source.score.staves.map((staff, staffNo) => { 
                    return {
                        ...staff,
                        voices: staff.voices.map((voice, voiceNo) => {
                            const elements1 = domainConverter.fromDef(flexibleItemToDef(voice.contentDef));
    
                            const newElements1 = pipe(
                                elements1, 
                                chainWithIndex((elementNo: number, element: ActiveSequenceItem) => {
                                    const elementIdentifier: ElementIdentifier = {
                                        staffNo, voiceNo, elementNo
                                    };
                                    if (this.selection.isSelected(elementIdentifier)) {
                                        if (isMusicEvent(element))
                                            return modifier(element);
                                    }
                                    return [element];
                                }));
                            const voiceContentNew = domainConverter.toDef(newElements1);
                            return {
                                ...voice,
                                contentDef: voiceContentNew
                            };
                        })
                    }; 
                }).filter(staff => staff)
            },
            vars: source.vars
        };
        return result;
    }
}

/*

Thougts about the "real" way to change selected items:

Convert domain from def to active
Iterate through elements
FlatMap:
    Convert element to domain
    Call modifier if selected
    Convert modified from domain
    Return results
Convert domain back to def

Big question: what if element from variable is included twice in selection? Modify twice?
If element is modified to another count and duration, we need to make sure the remaining elements still are selected correctly.
*/
