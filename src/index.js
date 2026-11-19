import { reactive } from 'vue';

import Parser from './frontend/parser.js';
import { createGlobalEnv, createHighEnv } from './runtime/env.js';
import { evaluate } from './runtime/interpreter.js';
import { logs } from './helps.js';

import fs from 'node:fs';

run('./code/', 'main.apl');


export const global = reactive({
    editor: null,
    console: null,

    lines: [],
    input:'',

    parser: new Parser(),
    env: createGlobalEnv(undefined, 'Main'),
});

function run(folder, filename, input) {
    const highEnv = createHighEnv();
    const env = createGlobalEnv(undefined, 'Main');

    highEnv.declareVar('folder', folder, true);
    highEnv.declareVar('parser', new Parser(), true);

	input = fs.readFileSync(folder + filename, 'utf8');

    const program = highEnv.lookupVar('parser').produceAST(input);
    highEnv.declareVar(folder + filename, program);

    logs('progr:',program);

    /** @type {string} */
	const result = evaluate(program, env, highEnv);
    result.repr(input);
    // logs('env:',env);
}

export function runCode(){
    global.env.clear();
    global.lines = [];

    const code = global.editor.getValue();
    const program = global.parser.produceAST(code);

    const result = evaluate(program, global.env, undefined);
    result.repr(code);
}
// export function runCode(){}

// Helper function to append logs
export function logToConsole(text) {
    const session = global.console.getSession();
    session.insert({ row: session.getLength(), column: 0 }, text + "\n");
}