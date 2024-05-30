import { modifyProject } from './../model/object-model-functional/project-iteration';
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
import { convertProjectDataToActive } from '~/model/object-model-functional/def-to-active';
import { convertProjectActiveToData } from '~/model/object-model-functional/active-to-def';

export class SelectionLens {
    constructor(private selection: Selection) {}

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


    change(source: ProjectDef, modifier: (element: MusicEvent) => MusicEvent[], domainConverter: DomainConverter<VoiceContentDef, ActiveSequence>): ProjectDef {

        const projectRes = pipe(
            source,
            convertProjectDataToActive,
            modifyProject(modifier, this.selection),
            convertProjectActiveToData
        );

        return projectRes;
    }
}

/*

Thougts about the "real" way to change selected items:

Convert domain from def to active
    Domain should include vars!
Iterate through elements
FlatMap:
    Convert element to domain
    Call modifier if selected
    Convert modified from domain
    Return results
Convert domain back to def

Big question: what if element from variable is included twice in selection? Modify twice?
If element is modified to another count and duration, we need to make sure the remaining elements still are selected correctly.

Probably the safest alternative is to throw if trying to modify a variable. But often the preferred way to structure a document is to
make all music in variables, and let score refer to variables.
*/
