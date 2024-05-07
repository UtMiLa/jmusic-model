import { pipe } from 'fp-ts/lib/function';
import { DomainConverter, FlexibleSequence, JMusic, MultiSequenceDef, MusicEvent, NoteBase, ProjectDef, ScoreDef, VariableRepository, VoiceContentDef, lensFromLensDef, voiceContentToSequence, voiceSequenceToDef } from '../model';
import { Selection, ElementIdentifier } from './selection-types';
import { chainWithIndex } from 'fp-ts/Array';

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


    change(source: ScoreDef, modifier: (element: MusicEvent) => MusicEvent[], vars?: VariableRepository): ScoreDef {
        const model = new JMusic(source, vars?.vars);

        const domainConverter: DomainConverter<VoiceContentDef, MusicEvent[]> = {
            fromDef: def => voiceContentToSequence(def, vars)[0].elements,
            toDef: events => voiceSequenceToDef(new FlexibleSequence(events, vars))
        };

        const result = {
            ...source, 
            staves: source.staves.map((staff, staffNo) => { 
                return {
                    ...staff,
                    voices: staff.voices.map((voice, voiceNo) => {
                        const seq = new FlexibleSequence(voice.contentDef, vars); // Todo: use DomainConverter
                        const elements = seq.elements; // Todo: use DomainConverter
/*
                        elements.forEach((elem, index) => {
                            const path = seq.indexToPath(index);
                            //const modified = seq.
                            const lens = lensFromLensDef<MusicEvent, ProjectDef, MusicEvent>(domainConverter, path);
                            model.overProject<MusicEvent>(lens as any, m =>{ const res = modifier(m); if (!(res?.length)) return m; return res[0]; });
                        });
                        */

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
                        const voiceContentNew = voiceSequenceToDef(new FlexibleSequence(newElements, vars)); // Todo: use DomainConverter
                        return {
                            ...voice,
                            contentDef: voiceContentNew
                        };
                    })
                }; 
            }).filter(staff => staff)
        };
        return model.model.project.score;
    }
}