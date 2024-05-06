import { pipe } from 'fp-ts/lib/function';
import { FlexibleSequence, MusicEvent, ScoreDef, voiceSequenceToDef } from '../model';
import { Selection, ElementIdentifier } from './selection-types';
import { chainWithIndex, replicate } from 'fp-ts/Array';

export class SelectionLens {
    constructor(private selection: Selection) {}

    get(source: ScoreDef) {
        const result: MusicEvent[] = [];
        source.staves.forEach((staff, staffNo) => {
            staff.voices.forEach((voice, voiceNo) => {
                const elements = new FlexibleSequence(voice.contentDef).elements; // Todo: use DomainConverter
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
        return voiceSequenceToDef(new FlexibleSequence(result)); // Todo: use DomainConverter
    }


    change(source: ScoreDef, modifier: (element: MusicEvent) => MusicEvent[]): ScoreDef {
        const result = {
            ...source, 
            staves: source.staves.map((staff, staffNo) => { 
                return {
                    ...staff,
                    voices: staff.voices.map((voice, voiceNo) => {
                        const elements = new FlexibleSequence(voice.contentDef).elements; // Todo: use DomainConverter

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
                        /*const newElements = elements.map((element, elementNo) => {
                            const elementIdentifier: ElementIdentifier = {
                                staffNo, voiceNo, elementNo
                            };
                            if (this.selection.isSelected(elementIdentifier)) {
                                return element;
                            }
                            return element;
                        });*/
                        const voiceContentNew = voiceSequenceToDef(new FlexibleSequence(newElements)); // Todo: use DomainConverter
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