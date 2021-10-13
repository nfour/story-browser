#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const makeStoryMap_1 = require("../cli/makeStoryMap");
const { dryRun: IS_DRY_RUN, output: OUTPUT = './storyMap.js', from: FROM = process.cwd(), stream: IS_STREAM, _: PATTERNS, } = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).command('makeStoryMap <patterns...>', 'Make a story map by matching glob patterns', (y) => y
    .option('output', {
    describe: 'The relative path to save output.',
    default: './storyMap.json',
    type: 'string',
})
    .option('from', {
    describe: 'The path to search from & generate imports',
    default: '<current working directory> ./',
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
})).argv;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const log = IS_STREAM ? () => { } : console.log;
void (async () => {
    log(`\nMaking story map...\n`);
    if (IS_DRY_RUN)
        log('Dry run.');
    const { outputFilePath, importPaths } = await (0, makeStoryMap_1.makeStoryMap)({
        outputPath: OUTPUT,
        patterns: PATTERNS,
        rootPath: FROM,
    });
    const text = (0, makeStoryMap_1.pathsToModuleExports)(importPaths);
    log(`Saving to: ${outputFilePath}`);
    if (!IS_DRY_RUN) {
        (0, fs_1.writeFileSync)(outputFilePath, text, 'utf8');
        log('Saved.');
    }
    log('');
    if (IS_STREAM || IS_DRY_RUN)
        console.log(text);
})();
