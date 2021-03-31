#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const makeStoryMap_1 = require("../makeStoryMap");
const { dryRun: IS_DRY_RUN, output: OUTPUT = './storyMap.json', from: FROM = process.cwd(), stream: IS_STREAM, _: PATTERNS, } = yargs_1.default(helpers_1.hideBin(process.argv)).command('makeStoryMap <patterns...>', 'Make a story map by matching glob patterns', (y) => {
    return y
        .option('output', {
        describe: 'The relative path to save output.',
        default: './storyMap.json',
        type: 'string',
    })
        .option('from', {
        describe: 'The relative path search from',
        default: '<current working directory>',
        type: 'string',
    })
        .option('dryRun', {
        describe: 'Set this to avoid writing any files.',
        default: false,
        type: 'boolean',
    })
        .option('stream', {
        describe: 'Hide all loggin so you can pipe the content to a file',
        default: false,
        type: 'boolean',
    });
}).argv;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const log = IS_STREAM ? () => { } : console.log;
void (async () => {
    log(`\nMaking story map...\n`);
    if (IS_DRY_RUN)
        log('Dry run.');
    const { outputFilePath, relativePaths } = await makeStoryMap_1.makeStoryMap({
        outputPath: OUTPUT,
        patterns: PATTERNS,
        rootPath: FROM,
    });
    const text = makeStoryMap_1.pathsToModuleExports(relativePaths);
    log(`Saving to: ${outputFilePath}`);
    if (!IS_DRY_RUN) {
        fs_1.writeFileSync(outputFilePath, text, 'utf8');
        log('Saved.');
    }
    log('');
    if (IS_STREAM || IS_DRY_RUN)
        console.log(text);
})();
