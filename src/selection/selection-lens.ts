import { pipe } from 'fp-ts/lib/function';
import { DomainConverter, MultiSequenceDef, MusicEvent, NoteBase, ProjectDef, ScoreDef, VoiceContentDef, lensFromLensDef, voiceContentToSequence, voiceSequenceToDef } from '../model';
import { Selection, ElementIdentifier } from './selection-types';
import { chainWithIndex } from 'fp-ts/Array';

export class SelectionLens {
    constructor(private selection: Selection) {}

    get(source: ScoreDef, domainConverter: DomainConverter<VoiceContentDef, MusicEvent[]>): VoiceContentDef {
        const result: MusicEvent[] = [];
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


    change(source: ScoreDef, modifier: (element: MusicEvent) => MusicEvent[], domainConverter: DomainConverter<VoiceContentDef, MusicEvent[]>): ScoreDef {

        const result = {
            ...source, 
            staves: source.staves.map((staff, staffNo) => { 
                return {
                    ...staff,
                    voices: staff.voices.map((voice, voiceNo) => {
                        const elements = domainConverter.fromDef(voice.contentDef);

                        const newElements = pipe(
                            elements, 
                            chainWithIndex((elementNo: number, element: MusicEvent) => {
                                const elementIdentifier: ElementIdentifier = {
                                    staffNo, voiceNo, elementNo
                                };
                                if (this.selection.isSelected(elementIdentifier)) {
                                    return modifier(element);
                                }
                                return [element];
                            }));
                        const voiceContentNew = domainConverter.toDef(newElements);
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