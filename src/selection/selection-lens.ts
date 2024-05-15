import { ConceptualSequence } from './../model/object-model-functional/types';
import { pipe } from 'fp-ts/lib/function';
import { DomainConverter, MultiSequenceDef, MusicEvent, NoteBase, ProjectDef, ScoreDef, VarDict, VoiceContentDef, flexibleItemToDef, isMusicEvent, lensFromLensDef, voiceContentToSequence, voiceSequenceToDef } from '../model';
import { Selection, ElementIdentifier } from './selection-types';
import { chainWithIndex, map } from 'fp-ts/Array';
import { convertConceptualSequenceToData, convertSequenceDataToConceptual, convertSequenceItemToConceptual } from '~/model/object-model-functional/conversions';
import { ConceptualSequenceItem } from '~/model/object-model-functional/types';

export class SelectionLens {
    constructor(private selection: Selection) {}

    get(source: ScoreDef, domainConverter: DomainConverter<VoiceContentDef, ConceptualSequence>): VoiceContentDef {
        const result: ConceptualSequence = [];
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


    change(source: ScoreDef, modifier: (element: MusicEvent) => MusicEvent[], domainConverter: DomainConverter<VoiceContentDef, ConceptualSequence>, vars: VarDict): ScoreDef {

        const result = {
            ...source, 
            staves: source.staves.map((staff, staffNo) => { 
                return {
                    ...staff,
                    voices: staff.voices.map((voice, voiceNo) => {
                        const elements1 = domainConverter.fromDef(flexibleItemToDef(voice.contentDef));

                        const newElements1 = pipe(
                            elements1, 
                            chainWithIndex((elementNo: number, element: ConceptualSequenceItem) => {
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
        };
        return result;
    }
}