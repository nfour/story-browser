#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const makeStoryMap_1 = require("../makeStoryMap");
const { dryRun: IS_DRY_RUN, output: OUTPUT = "./storyMap.json", from: FROM = process.cwd(), _: PATTERNS, } = yargs_1.default(helpers_1.hideBin(process.argv)).command("makeStoryMap <patterns...>", "Make a story map by matching glob patterns", (y) => {
    return y
        .option("output", {
        describe: "The relative path to save output.",
        default: "./storyMap.json",
        type: "string",
    })
        .option("from", {
        describe: "The relative path search from",
        default: "<current working directory>",
        type: "string",
    })
        .option("dryRun", {
        describe: "Set this to avoid writing any files.",
        default: false,
        type: "boolean",
    });
}).argv;
void (async () => {
    console.log(`\nMaking story map...\n`);
    console.dir({
        PATTERNS,
        IS_DRY_RUN,
        OUTPUT,
    });
    console.log("");
    const { outputFilePath, relativePaths } = await makeStoryMap_1.makeStoryMap({
        outputPath: OUTPUT,
        patterns: PATTERNS,
        rootPath: FROM,
    });
    if (IS_DRY_RUN) {
        console.log("(Dry run) Found matches:");
        console.dir(relativePaths);
        console.log(`Would save to: ${outputFilePath}`);
    }
    else {
        makeStoryMap_1.writeStoryMap(relativePaths, outputFilePath);
        console.log(`Saved to: ${outputFilePath}`);
    }
    console.log("");
})();
