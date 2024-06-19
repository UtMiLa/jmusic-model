import { modifyProject } from '../model/active-project/project-iteration';
import { ActiveSequence } from '../model/active-project/types';
import { pipe } from 'fp-ts/lib/function';
import { DomainConverter, MusicEvent, ProjectDef, VoiceContentDef } from '../model';
import { MusicSelection, ElementIdentifier } from './selection-types';
import { convertProjectDataToActive } from '../model/active-project/def-to-active';
import { convertProjectActiveToData } from '../model/active-project/active-to-def';

export class SelectionLens {
    constructor(private selection: MusicSelection) {}

    get(source: ProjectDef, domainConverter: DomainConverter<VoiceContentDef, ActiveSequence>): VoiceContentDef {
        const result: ActiveSequence = [];
        source.score.staves.forEach((staff, staffNo) => {
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


    change(source: ProjectDef, modifier: (element: MusicEvent) => MusicEvent[]): ProjectDef {

        const projectRes = pipe(
            source,
            convertProjectDataToActive, // Convert domain from def to active
            modifyProject(modifier, this.selection), // Modify selected elements
            convertProjectActiveToData // Convert domain back to def
        );

        return projectRes;
    }
}

/*
Big question: what if element from variable is included twice in selection? Modify twice?
If element is modified to another count and duration, we need to make sure the remaining elements still are selected correctly.

Probably the safest alternative is to throw if trying to modify a variable. But often the preferred way to structure a document is to
make all music in variables, and let score refer to variables.
*/
