import R = require('ramda');
import { VariableRef, SeqFunction, isFuncDef } from '../../model';
import { sequence, mapResult, many, select } from './argument-modifiers';
import { KeyArg, PitchArg, VariableReferenceArg } from './argument-types';
import { ArgumentType, IntegerArg, RationalArg, WordArg } from './base-argument-types';


//return ['Identity', 'Relative', 'Reverse', 'Repeat', 'Grace', 'Tuplet', 'Transpose', 'ModalTranspose', 'AddLyrics'].includes(test);

function makeArgs<T>(...args: unknown[]): ArgumentType<T> {
    return (sequence as any as ((arg: unknown[]) => ArgumentType<T>))([...R.intersperse(' *, ', args), ' *, ']);
}

const _parameterArg: ArgumentType<string[]> = (input: string): [string[], string] => {
    return [[], input];
};

const EmptyArgumentsArg = sequence<string, string[], VariableRef>(['\\@', WordArg, '\\( ', _parameterArg, VariableReferenceArg, '\\s*\\)']);

const RelativeArgumentsArg = makeArgs(PitchArg);

const RepeatArgumentsArg = makeArgs<number>(IntegerArg);

const TupletArgumentsArg = sequence<string, string[], VariableRef>(['\\@', WordArg, '\\( ',  makeArgs<string[]>(RationalArg), VariableReferenceArg, '\\s*\\)']);

const TransposeArgumentsArg = makeArgs(sequence(['from ', PitchArg, ' *to ', PitchArg]));

const ModalTransposeArgumentsArg = makeArgs(sequence([KeyArg, ' ', IntegerArg]));

const AddLyricsArgumentsArg = makeArgs(many(WordArg));

const NoArgsFunctionArg = sequence<string, VariableRef>(['\\@', WordArg, '\\( ', VariableReferenceArg, '\\s*\\)']);
const RepeatFunctionArg = sequence<string, number, VariableRef>(['\\@', WordArg, '\\( ', RepeatArgumentsArg, VariableReferenceArg, '\\s*\\)']);

const FuncCombinedArg = select([EmptyArgumentsArg, TupletArgumentsArg]);

export const FunctionArg = mapResult(FuncCombinedArg, ([funcName, funcArgs, variableRef]): SeqFunction => { 
    if (!isFuncDef(funcName)) throw 'Bad function name';
    return {
        function: funcName,
        args: [variableRef],
        extraArgs: funcArgs
    };
});