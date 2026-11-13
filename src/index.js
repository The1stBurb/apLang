import Parser from './frontend/parser.js';
import { createGlobalEnv, createHighEnv } from './runtime/env.js';
import { evaluate } from './runtime/interpreter.js';

import { logs } from './helps.js';

// import fs from 'node:fs';
// const fs = require('node:fs');

// run('./code/', 'main.apl');


function run(folder, filename, input) {
    const highEnv = createHighEnv();
    const env = createGlobalEnv(undefined, 'Main');

    highEnv.declareVar('folder', folder, true);
    highEnv.declareVar('parser', new Parser(), true);

	// const input = fs.readFileSync(folder + filename, 'utf8');

    const program = highEnv.lookupVar('parser').produceAST(input);
    highEnv.declareVar(folder + filename, program);

    // logs('progr:',program);
    // fs.writeFileSync(folder + 'output.json', JSON.stringify(program));

    /** @type {string} */
	const result = evaluate(program, env, highEnv);
	// console.log('res:',result);
}