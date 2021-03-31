#!/usr/bin/env node

import Yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { makeStoryMap, writeStoryMap } from "../makeStoryMap";

const {
  dryRun: IS_DRY_RUN,
  output: OUTPUT = "./storyMap.json",
  from: FROM = process.cwd(),
  _: PATTERNS,
} = Yargs(hideBin(process.argv)).command(
  "makeStoryMap <patterns...>",
  "Make a story map by matching glob patterns",
  (y) => {
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
  }
).argv;

void (async () => {
  console.log(`\nMaking story map...\n`);

  console.dir({
    PATTERNS,
    IS_DRY_RUN,
    OUTPUT,
  });

  console.log("");

  const { outputFilePath, relativePaths } = await makeStoryMap({
    outputPath: OUTPUT,
    patterns: PATTERNS as string[],
    rootPath: FROM,
  });

  if (IS_DRY_RUN) {
    console.log("(Dry run) Found matches:");
    console.dir(relativePaths);
    console.log(`Would save to: ${outputFilePath}`);
  } else {
    writeStoryMap(relativePaths, outputFilePath);
    console.log(`Saved to: ${outputFilePath}`);
  }

  console.log("");
})();
