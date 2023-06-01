import { isVariableRef, VariableRef, VariableRepository, VariableDef } from './variables';
import R = require('ramda');
import { TimeSpan, AbsoluteTime, Time, ExtendedTime } from '../rationals/time';
import { createFunction, isSeqFunction, SeqFunction } from './functions';
import { BaseSequence, getDuration, ISequence, isMusicEvent, isNote, MusicEvent, parseLilyElement, splitByNotes } from './sequence';

// Fix for types for R.chain
import * as _ from 'ts-toolbelt';
import { Note, noteAsLilypond } from '../notes/note';
type addIndexFix<T, U> = (
    fn: (f: (item: T) => U, list: readonly T[]) => U,
) => _.F.Curry<(a: (item: T, idx: number, list: T[]) => U, b: readonly T[]) => U>;


export type FlexibleItem = string | SeqFunction | VariableRef | FlexibleItem[] | MusicEvent;

export type PathElement = string | number;

function recursivelySplitStringsIn(item: FlexibleItem, repo: VariableRepository): FlexibleItem[] {
    if (typeof item === 'string') {
        return splitByNotes(item);
    } else if (isSeqFunction(item)) {
        const x = R.modify('args', args => recursivelySplitStringsIn(args, repo), item) as unknown as FlexibleItem[];
        return x;
    } else if (isVariableRef(item)) {
        return [item]; //repo.valueOf(item.variable).elements;
    } else if (isMusicEvent(item)) {
        return [item];
    } else {
        return item.map(i => recursivelySplitStringsIn(i, repo));
    }
}

function simplifyDef(item: FlexibleItem): FlexibleItem {
    
    if (R.is(Array, item)) {
        if (item.length === 1)
            return simplifyDef(item[0]);
        return item.map(simplifyDef);
    } else if (isSeqFunction(item)) {
        const x = R.modify('args', args => simplifyDef(args), item) as unknown as FlexibleItem[];
        return x;
    } else if (isVariableRef(item)) {
        return item;
    } else if (isNote(item as MusicEvent)) {
        return noteAsLilypond(item as Note);
    }
    return item;
    
}

function calcElements(items: FlexibleItem[], repo: VariableRepository): MusicEvent[] {
    return new FlexibleSequence(items, repo, true).elements;
}

function isSingleStringArray(test: unknown): test is string[] {
    return (test as string[]).length === 1 && typeof ((test as string[])[0]) === 'string';
}

function isOtherFlexibleItemArray(test: unknown): test is FlexibleItem[] {
    return true;
}

interface InternalElement {
    element: MusicEvent;
    time: AbsoluteTime;
    def?: FlexibleItem;
    lens: R.Lens<ISequence, MusicEvent | undefined>;
}

export class FlexibleSequence extends BaseSequence {

    constructor(init: FlexibleItem, private repo: VariableRepository = new VariableRepository([]), alreadySplit = false) {
        super();

        if (!alreadySplit) repo.observer$.subscribe(newRepo => {
            this.def = recursivelySplitStringsIn(init, newRepo);
        });
        this.def = alreadySplit ? init as FlexibleItem[] : recursivelySplitStringsIn(init, repo);
    }

    private _elements: MusicEvent[] = [];

    get elements(): MusicEvent[] {
        //return this.getElementLens()
        return R.flatten(this._elements.map((item) => isFlexibleSequence(item) ? item.elements : [item]));
    }

    /*get structuredElements(): FlexibleItem[] {
        return this.def.map((item) => isFlexibleSequence(item) ? [item.structuredElements] : simplifyDef(item));
    }*/

    internalElements: InternalElement[] = [];


    private iterateDef(items: FlexibleItem[], modifier: (event: MusicEvent) => MusicEvent[], time: AbsoluteTime, startTime: AbsoluteTime = Time.StartTime): [AbsoluteTime, FlexibleItem] {
        const transformed = items.map(item => {

            return R.cond<FlexibleItem, string, SeqFunction, VariableRef, string[], MusicEvent, FlexibleItem[], MusicEvent[]>([
                [R.is(String), ((item: string) => {
                    const event = parseLilyElement(item) as MusicEvent;
                    if (Time.equals(startTime, time)) {
                        startTime = Time.addTime(startTime, getDuration(event));
                        return modifier(event);
                    }
                    startTime = Time.addTime(startTime, getDuration(event));
                    return [event];
                })],
                [isSeqFunction, (item: SeqFunction) => createFunction(item.function, item.extraArgs)(calcElements([item.args], this.repo))],
                [isVariableRef, (item: VariableRef) => calcElements(this.repo.valueOf(item.variable).elements, this.repo)],
                [isSingleStringArray, (item: string[]) => [parseLilyElement(item[0])]],
                [isMusicEvent, (item: MusicEvent) => {
                    if (Time.equals(startTime, time)) {
                        startTime = Time.addTime(startTime, getDuration(item));
                        return modifier(item);
                    }
                    startTime = Time.addTime(startTime, getDuration(item));
                    return [item];
                }],
                [isOtherFlexibleItemArray, (elm) => {
                    [startTime, item] = this.iterateDef(elm, modifier, time, startTime);
                    return item as MusicEvent[];
                }]
            ])(item);  
        }); 
        return [startTime, transformed];
    }

    public getElementLens(time: AbsoluteTime): R.Lens<ISequence, MusicEvent | undefined> {
        /* */return R.lens(

            (seq: ISequence) => this.elements[seq.indexOfTime(time)], 
    
            (event: MusicEvent | undefined, seq) => {
                if (!(seq instanceof FlexibleSequence)) {
                    throw 'Lens setter not supported';
                } 

                return new FlexibleSequence(seq.iterateDef(this.def, () => (event ? [event] : []), time)[1]);                
            }
        );// */
        return this.internalElements.find(elm => Time.equals(elm.time as ExtendedTime, time))?.lens as any;
    }



    get duration(): TimeSpan {
        return this._elements.reduce((prev, curr) => Time.addSpans(prev, getDuration(curr)), Time.NoTime);
    }

    get count(): number {
        return this._elements.reduce((prev, curr) => isFlexibleSequence(curr) ? prev + curr.count : prev + 1, 0);
    }

    private _def!: FlexibleItem[];
    public get def(): FlexibleItem[] {
        return this._def.map(simplifyDef);
    }
    public set def(init: FlexibleItem[]) {
        this._def = init;
        let time = Time.StartTime;

        const timify = (element: MusicEvent): InternalElement => {

            const lens = R.lens(
                (seq: ISequence) => element,
                (event: MusicEvent | undefined, seq) => {
                    if (!(seq instanceof FlexibleSequence)) {
                        throw 'Lens setter not supported';
                    } 
    
                    return new FlexibleSequence(seq.iterateDef(this._def, () => (event ? [event] : []), time)[1]);                
                }
            );
            
            const result: InternalElement = { element, time, lens };
            time = Time.addTime(time, getDuration(element));

            
            return result;
        };

        this.internalElements = R.chain(
            R.cond<FlexibleItem, string, SeqFunction, VariableRef, string[], MusicEvent, FlexibleItem[], InternalElement[]>([
                [R.is(String), ((item: string) => {
                    return [timify(parseLilyElement(item) as MusicEvent)];
                })],
                [isSeqFunction, (item: SeqFunction) => {
                    return createFunction(item.function, item.extraArgs)(calcElements([item.args], this.repo)).map(timify);
                }],
                [isVariableRef, (item: VariableRef) => calcElements(this.repo.valueOf(item.variable).elements, this.repo).map(timify)],
                [isSingleStringArray, (item: string[]) => {
                    return [timify(parseLilyElement(item[0]))]; 
                }],
                [isMusicEvent, (item: MusicEvent) => {
                    return [timify(item)]; 
                }],
                [isOtherFlexibleItemArray, (elm) => {
                    return calcElements(elm, this.repo).map(timify);
                }]
            ])            
            , init);

        this._elements = this.internalElements.map(ie => ie.element);
    }


    modifyItem(lens: R.Lens<FlexibleItem, FlexibleItem>, changer: (x: FlexibleItem) => FlexibleItem): void {
        R.over(lens, changer);
    }


    indexToPath(index: number, repos?: VariableRepository): PathElement[] {

        const repo = repos ?? new VariableRepository([]);

        const itemsToPaths = (item: FlexibleItem): PathElement[][] => {
            if (typeof item === 'string') {
                const no = splitByNotes(item).length;
                return R.range(0, no).map(n => [n]);
            } else if (isSeqFunction(item)) {
                return createFunction(item.function, item.extraArgs)(calcElements([item.args], this.repo)).map((a, i) => ['args', i]);
            } else if (isVariableRef(item)) {
                //return R.chain(itemsToPaths, repo.valueOf(item.variable).elements);
                return R.range(0, repo.valueOf(item.variable).elements.length).map(n => ['vars', item.variable, n]);
            } else if (isMusicEvent(item)) {
                return [[0]];
            } else {
                return (R.addIndex as addIndexFix<FlexibleItem, PathElement[][]>)(R.chain<FlexibleItem, PathElement[]>)(
                    (s: FlexibleItem, idx: number) => itemsToPaths(s).map(x => R.head(x) === 'vars' ? x : [idx, ...x]), 
                    item
                );
            }
        };
        
        const allPaths = itemsToPaths(this._def);

        if (index >= allPaths.length) throw 'Illegal index';

        return allPaths[index];
    }

    appendElement(element: FlexibleItem): void {
        if (R.is(Array, this.def)) {
            this.def = R.append(element, this.def);
        } else {
            this.def = [this.def, element];
        }
    }    


    deleteElement(i: number | AbsoluteTime): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i, this.repo);

        if (path.length === 2) {
            this.def = R.remove(path[0] as number, 1, this.def);
            return;
        }
        

        throw 'Not implemented';

    }

    modifyElement(i: number | AbsoluteTime, fn: (from: FlexibleItem) => FlexibleItem): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i, this.repo);
        
        if (path.length === 2) {
            this.def = R.modify(path[0] as number, fn, this.def);
            return;
        }
        

        throw 'Not implemented';

    }    


    insertElement(i: number | AbsoluteTime, element: FlexibleItem): void {
        if (typeof i !== 'number') i = this.indexOfTime(i);
        const path = this.indexToPath(i, this.repo);
        //[1,0] tager def og indsætter element før index 1
        if (path.length === 2) {
            this.def = R.insert(path[0] as number, element, this.def);
            return;
        }
        

        throw 'Not implemented';
        /*
        const setPath = (def: FlexibleItem, path: PathElement[], element: MusicEvent) => {
            const [i, ...rest] = path;
            //const thing = def[i];
        };
        */
        //this.def.splice(i, 0, element);

    }    
}

export function isFlexibleSequence(test: unknown): test is FlexibleSequence {
    return !!test && (test as FlexibleSequence).constructor?.name === 'FlexibleSequence';
}